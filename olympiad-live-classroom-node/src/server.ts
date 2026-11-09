
import http from 'node:http';
import { Server } from 'socket.io';
import { RoomServiceClient } from 'livekit-server-sdk';
import { createApp } from './app.js';
import { verifyToken } from './auth/jwt.js';
import { config } from './config/env.js';
import { pool } from './database/pool.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true,
  },
});

// ============================================================
// TYPES
// ============================================================

interface PollOption {
  optionId: string;
  optionText: string;
  votes: number;
}

interface Poll {
  pollId: string;
  classroomId: string;
  createdBy: string;
  question: string;
  options: PollOption[];
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
  startedAt?: string;
  closedAt?: string;
  votesByUser: Set<string>;
}

interface QuestionOption {
  optionId: string;
  optionText: string;
}

interface Question {
  questionId: string;
  classroomId: string;
  createdBy: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  durationSeconds: number;
  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'TIME_EXPIRED'
    | 'CLOSED'
    | 'ANSWER_REVEALED';
  createdAt: string;
  startedAt?: string;
  endsAt?: string;
  revealedAt?: string;
  timer?: NodeJS.Timeout;
  answersByUser?: Map<string, { optionId: string; submittedAt: string }>;
}

// ============================================================
// IN-MEMORY STATE
// ============================================================

const polls = new Map<string, Poll>();
const questions = new Map<string, Question>();

// ============================================================
// LIVEKIT
// ============================================================

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL ?? 'http://localhost:7880',
  process.env.LIVEKIT_API_KEY ?? 'devkey',
  process.env.LIVEKIT_API_SECRET ?? 'secretkeysecretkeysecretkey12'
);

// ============================================================
// SOCKET.IO AUTHENTICATION
// ============================================================

io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;

    if (typeof authToken !== 'string' || !authToken.trim()) {
      return next(new Error('Missing token'));
    }

    const token = authToken.replace(/^Bearer\s+/i, '').trim();

    const claims = verifyToken(token);

    socket.data.userId = claims.userId;
    socket.data.email = claims.email;
    socket.data.roles = claims.roles;

    console.log('[Socket.IO Auth] Authenticated:', {
      userId: claims.userId,
      email: claims.email,
      roles: claims.roles,
    });

    return next();
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error(String(err));

    console.error('[Socket.IO Auth] Verification failed:', {
      errorName: error.name,
      errorMessage: error.message,
    });

    return next(new Error('Unauthorized'));
  }
});

// ============================================================
// AUTHORIZATION HELPERS
// ============================================================

function isTeacher(roles: string[]): boolean {
  return roles.includes('TEACHER') || roles.includes('ADMIN');
}

function publicQuestion(q: Question, reveal: boolean) {
  return {
    questionId: q.questionId,
    classroomId: q.classroomId,
    questionText: q.questionText,
    options: q.options,
    status: q.status,
    durationSeconds: q.durationSeconds,
    startedAt: q.startedAt,
    endsAt: q.endsAt,
    revealedAt: q.revealedAt,
    ...(reveal
      ? {
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
        }
      : {}),
  };
}

// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on('connection', (socket) => {
  const userId = socket.data.userId as string;
  const email = socket.data.email as string;
  const roles = socket.data.roles as string[];

  console.log('[Socket.IO] Connected:', {
    socketId: socket.id,
    userId,
    email,
    roles,
  });

  socket.emit('CLASSROOM_JOINED', {
    userId,
    message: 'connected',
  });

  // ==========================================================
  // CHAT JOIN
  // ==========================================================

  socket.on('chat:join', (payload: { classId?: string }) => {
    const classId = payload?.classId;

    if (!classId) {
      socket.emit('chat:error', {
        message: 'classId required',
      });
      return;
    }

    socket.join(`class:${classId}`);

    io.to(`class:${classId}`).emit('chat:presence', {
      classId,
      userId,
      status: 'joined',
    });
  });

  // ==========================================================
  // CHAT LEAVE
  // ==========================================================

  socket.on('chat:leave', (payload: { classId?: string }) => {
    const classId = payload?.classId;

    if (!classId) return;

    io.to(`class:${classId}`).emit('chat:presence', {
      classId,
      userId,
      status: 'left',
    });

    socket.leave(`class:${classId}`);
  });

  // ==========================================================
  // CHAT SEND
  // ==========================================================

  socket.on(
    'chat:send',
    async (
      payload: {
        classId?: string;
        message?: string;
        clientMessageId?: string;
      },
      ack?: (response: { ok: boolean; message?: unknown; error?: string }) => void
    ) => {
      const reply = (response: { ok: boolean; message?: unknown; error?: string }) => {
        if (typeof ack === 'function') {
          ack(response);
        }
      };

      const classId = payload?.classId;
      const message = (payload?.message ?? '').trim();
      const clientMessageId =
        typeof payload?.clientMessageId === 'string' && payload.clientMessageId.trim()
          ? payload.clientMessageId.trim()
          : undefined;

      if (!classId || !message) {
        const error = 'classId and message required';
        socket.emit('chat:error', { message: error });
        reply({ ok: false, error });
        return;
      }

      if (message.length > 1000) {
        const error = 'Message too long';
        socket.emit('chat:error', { message: error });
        reply({ ok: false, error });
        return;
      }

      // Only members of the joined room can send messages.
      if (!socket.rooms.has(`class:${classId}`)) {
        const error = 'Join classroom before sending messages';
        socket.emit('chat:error', { message: error });
        reply({ ok: false, error });
        return;
      }

      try {
        const result = await pool.query(
          `INSERT INTO classroom_chat_messages
           (classroom_id, sender_id, sender_name, message)
           VALUES ($1, $2, $3, $4)
           RETURNING id, created_at`,
          [classId, userId, email, message]
        );

        const row = result.rows[0];

        const chatMessage = {
          messageId: String(row.id),
          clientMessageId,
          classroomId: classId,
          senderId: userId,
          senderName: email,
          message,
          timestamp: new Date(row.created_at).toISOString(),
        };

        io.to(`class:${classId}`).emit('chat:message', chatMessage);
        reply({ ok: true, message: chatMessage });
      } catch (err) {
        console.error('[Chat] Persistence error:', err);

        const error = 'Failed to persist message';
        socket.emit('chat:error', { message: error });
        reply({ ok: false, error });
      }
    }
  );

  // ==========================================================
  // CHAT HISTORY
  // ==========================================================

  socket.on(
    'chat:history',
    async (payload: {
      classId?: string;
      limit?: number;
    }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('chat:error', {
          message: 'classId required',
        });
        return;
      }

      if (!socket.rooms.has(`class:${classId}`)) {
        socket.emit('chat:error', {
          message: 'Join classroom before loading history',
        });
        return;
      }

      const requestedLimit = Number(payload?.limit ?? 50);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
        : 50;

      try {
        const result = await pool.query(
          `SELECT id, sender_id, sender_name, message, created_at
           FROM classroom_chat_messages
           WHERE classroom_id = $1
           ORDER BY created_at ASC, id ASC
           LIMIT $2`,
          [classId, limit]
        );

        const messages = result.rows.map((r) => ({
          messageId: String(r.id),
          classroomId: classId,
          senderId: r.sender_id,
          senderName: r.sender_name,
          message: r.message,
          timestamp: new Date(r.created_at).toISOString(),
        }));

        socket.emit('chat:history', {
          classId,
          messages,
        });
      } catch (err) {
        console.error('[Chat] History error:', err);

        socket.emit('chat:error', {
          message: 'Failed to load history',
        });
      }
    }
  );

  // ==========================================================
  // POLL CREATE
  // ==========================================================

  socket.on(
    'poll:create',
    (payload: {
      classId?: string;
      question?: string;
      options?: string[];
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('poll:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;
      const question = (payload?.question ?? '').trim();

      const options = (payload?.options ?? [])
        .map((o) => o.trim())
        .filter(Boolean);

      if (
        !classId ||
        !question ||
        options.length < 2 ||
        new Set(options).size !== options.length
      ) {
        socket.emit('poll:error', {
          message: 'Invalid poll',
        });
        return;
      }

      const poll: Poll = {
        pollId: `poll-${Date.now()}`,
        classroomId: classId,
        createdBy: userId,
        question,
        options: options.map((option, index) => ({
          optionId: `opt-${index + 1}`,
          optionText: option,
          votes: 0,
        })),
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        votesByUser: new Set(),
      };

      polls.set(poll.pollId, poll);

      io.to(`class:${classId}`).emit('poll:state', {
        pollId: poll.pollId,
        status: poll.status,
        question: poll.question,
        options: poll.options.map(
          ({ optionId, optionText }) => ({
            optionId,
            optionText,
          })
        ),
      });
    }
  );

  // ==========================================================
  // QUESTION CREATE
  // ==========================================================

  socket.on(
    'question:create',
    (payload: {
      classId?: string;
      questionText?: string;
      options?: string[];
      correctOptionId?: string;
      durationSeconds?: number;
      explanation?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('question:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;
      const questionText = (payload?.questionText ?? '').trim();

      const options = (payload?.options ?? [])
        .map((o) => o.trim())
        .filter(Boolean);

      const durationSeconds = payload?.durationSeconds ?? 30;

      if (
        !classId ||
        !questionText ||
        options.length < 2 ||
        !Number.isInteger(durationSeconds) ||
        durationSeconds < 5 ||
        durationSeconds > 3600
      ) {
        socket.emit('question:error', {
          message: 'Invalid question',
        });
        return;
      }

      const questionOptions = options.map((option, index) => ({
        optionId: `opt-${index + 1}`,
        optionText: option,
      }));

      const correctOptionId =
        payload?.correctOptionId ?? 'opt-1';

      if (
        !questionOptions.some(
          (option) => option.optionId === correctOptionId
        )
      ) {
        socket.emit('question:error', {
          message: 'Invalid correctOptionId',
        });
        return;
      }

      const q: Question = {
        questionId: `q-${Date.now()}`,
        classroomId: classId,
        createdBy: userId,
        questionText,
        options: questionOptions,
        correctOptionId,
        explanation: payload?.explanation,
        durationSeconds,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };

      q.answersByUser = new Map();
      questions.set(q.questionId, q);

      io.to(`class:${classId}`).emit(
        'question:state',
        publicQuestion(q, false)
      );
    }
  );

  // ==========================================================
  // QUESTION START
  // ==========================================================

  socket.on(
    'question:start',
    (payload: {
      classId?: string;
      questionId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('question:error', {
          message: 'Teacher only',
        });
        return;
      }

      const q = questions.get(payload?.questionId ?? '');

      if (!q || q.classroomId !== payload?.classId) {
        socket.emit('question:error', {
          message: 'Question not found',
        });
        return;
      }

      if (q.status !== 'DRAFT' && q.status !== 'TIME_EXPIRED' && q.status !== 'CLOSED') {
        socket.emit('question:error', {
          message: 'Question cannot be started in its current state',
        });
        return;
      }
      if (q.timer) { clearTimeout(q.timer); q.timer = undefined; }
      if (q.status !== 'DRAFT') {
        q.answersByUser = new Map();
        q.revealedAt = undefined;
      }

      q.status = 'ACTIVE';
      q.startedAt = new Date().toISOString();
      q.endsAt = new Date(
        Date.now() + q.durationSeconds * 1000
      ).toISOString();

      const remaining = () =>
        Math.max(
          0,
          Math.ceil(
            (new Date(q.endsAt!).getTime() - Date.now()) / 1000
          )
        );

      io.to(`class:${q.classroomId}`).emit('question:timer', {
        questionId: q.questionId,
        remainingSeconds: remaining(),
        endsAt: q.endsAt,
      });

      q.timer = setTimeout(() => {
        q.status = 'TIME_EXPIRED';
        q.timer = undefined;

        io.to(`class:${q.classroomId}`).emit(
          'question:time_expired',
          {
            questionId: q.questionId,
            endsAt: q.endsAt,
          }
        );

        io.to(`class:${q.classroomId}`).emit(
          'question:state',
          publicQuestion(q, false)
        );
      }, q.durationSeconds * 1000);

      io.to(`class:${q.classroomId}`).emit(
        'question:state',
        publicQuestion(q, false)
      );
    }
  );

  // ==========================================================
  // QUESTION CLOSE
  // ==========================================================

  socket.on(
    'question:close',
    (payload: {
      classId?: string;
      questionId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('question:error', {
          message: 'Teacher only',
        });
        return;
      }

      const q = questions.get(payload?.questionId ?? '');

      if (!q || q.classroomId !== payload?.classId) {
        socket.emit('question:error', {
          message: 'Question not found',
        });
        return;
      }

      if (q.timer) {
        clearTimeout(q.timer);
        q.timer = undefined;
      }

      q.status = 'CLOSED';

      io.to(`class:${q.classroomId}`).emit(
        'question:state',
        publicQuestion(q, false)
      );
    }
  );

  // ==========================================================
  // QUESTION REVEAL ANSWER
  // ==========================================================

  socket.on(
    'question:reveal_answer',
    (payload: {
      classId?: string;
      questionId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('question:error', {
          message: 'Teacher only',
        });
        return;
      }

      const q = questions.get(payload?.questionId ?? '');

      if (!q || q.classroomId !== payload?.classId) {
        socket.emit('question:error', {
          message: 'Question not found',
        });
        return;
      }

      if (q.timer) {
        clearTimeout(q.timer);
        q.timer = undefined;
      }

      q.status = 'ANSWER_REVEALED';
      q.revealedAt = new Date().toISOString();

      io.to(`class:${q.classroomId}`).emit(
        'question:answer_revealed',
        {
          questionId: q.questionId,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          revealedAt: q.revealedAt,
        }
      );

      io.to(`class:${q.classroomId}`).emit(
        'question:state',
        publicQuestion(q, true)
      );
    }
  );

  // ==========================================================
  // QUESTION SYNC (reconnect / join)
  // ==========================================================

  socket.on(
    'question:sync',
    (payload: { classId?: string }, ack?: (r: { ok: boolean; question?: unknown; error?: string }) => void) => {
      const reply = (r: { ok: boolean; question?: unknown; error?: string }) => {
        if (typeof ack === 'function') ack(r);
      };
      const classId = payload?.classId;
      if (!classId) { reply({ ok: false, error: 'classId required' }); return; }
      if (!socket.rooms.has(`class:${classId}`)) { reply({ ok: false, error: 'Join classroom first' }); return; }
      let current: Question | undefined;
      for (const q of questions.values()) {
        if (q.classroomId !== classId) continue;
        if (q.status === 'ACTIVE' || q.status === 'TIME_EXPIRED' || q.status === 'DRAFT') { current = q; break; }
        if (!current || (q.createdAt > current.createdAt)) current = q;
      }
      if (!current) { reply({ ok: true, question: null }); return; }
      const reveal = current.status === 'ANSWER_REVEALED';
      const base = publicQuestion(current, reveal);
      const myAnswer = current.answersByUser?.get(userId);
      reply({
        ok: true,
        question: {
          ...base,
          myAnswer: myAnswer ? { optionId: myAnswer.optionId, submittedAt: myAnswer.submittedAt } : null,
        },
      });
    }
  );

  // ==========================================================
  // QUESTION ANSWER (student)
  // ==========================================================

  socket.on(
    'question:answer',
    (
      payload: { classId?: string; questionId?: string; optionId?: string },
      ack?: (r: { ok: boolean; error?: string; alreadySubmitted?: boolean }) => void
    ) => {
      const reply = (r: { ok: boolean; error?: string; alreadySubmitted?: boolean }) => {
        if (typeof ack === 'function') ack(r);
      };
      const classId = payload?.classId;
      const questionId = payload?.questionId;
      const optionId = payload?.optionId;
      if (!classId || !questionId || !optionId) { reply({ ok: false, error: 'classId, questionId and optionId required' }); return; }
      if (!socket.rooms.has(`class:${classId}`)) { reply({ ok: false, error: 'Join classroom first' }); return; }
      if (isTeacher(roles)) { reply({ ok: false, error: 'Teachers cannot submit answers' }); return; }
      const q = questions.get(questionId);
      if (!q || q.classroomId !== classId) { reply({ ok: false, error: 'Question not found' }); return; }
      if (q.status !== 'ACTIVE') { reply({ ok: false, error: 'Question is not accepting answers' }); return; }
      if (q.endsAt && Date.now() > new Date(q.endsAt).getTime()) {
        q.status = 'TIME_EXPIRED';
        io.to(`class:${classId}`).emit('question:state', publicQuestion(q, false));
        reply({ ok: false, error: 'Question time has expired' });
        return;
      }
      if (!q.options.some((o) => o.optionId === optionId)) { reply({ ok: false, error: 'Invalid option' }); return; }
      q.answersByUser = q.answersByUser ?? new Map();
      if (q.answersByUser.has(userId)) { reply({ ok: false, error: 'Already submitted', alreadySubmitted: true }); return; }
      const submittedAt = new Date().toISOString();
      q.answersByUser.set(userId, { optionId, submittedAt });
      reply({ ok: true });
      io.to(`class:${classId}`).emit('question:stats', {
        questionId: q.questionId,
        classId,
        answeredCount: q.answersByUser.size,
      });
    }
  );

  // ==========================================================
  // MODERATION: RAISE HAND
  // ==========================================================

  socket.on(
    'moderation:raise_hand',
    (payload: { classId?: string }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('moderation:error', {
          message: 'classId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:hand_raised',
        {
          classId,
          userId,
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: LOWER HAND
  // ==========================================================

  socket.on(
    'moderation:lower_hand',
    (payload: { classId?: string }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('moderation:error', {
          message: 'classId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:hand_lowered',
        {
          classId,
          userId,
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: MEDIA REQUEST
  // ==========================================================

  socket.on(
    'moderation:media_request',
    (payload: {
      classId?: string;
      kind?: string;
    }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('moderation:error', {
          message: 'classId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:media_request',
        {
          classId,
          userId,
          kind: payload?.kind ?? 'microphone',
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: MEDIA APPROVED
  // ==========================================================

  socket.on(
    'moderation:media_approved',
    (payload: {
      classId?: string;
      userId?: string;
      kind?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:media_approved',
        {
          classId,
          userId: payload.userId,
          kind: payload.kind ?? 'microphone',
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: MEDIA DENIED
  // ==========================================================

  socket.on(
    'moderation:media_denied',
    (payload: {
      classId?: string;
      userId?: string;
      kind?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:media_denied',
        {
          classId,
          userId: payload.userId,
          kind: payload.kind ?? 'microphone',
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: SCREEN SHARE REQUEST
  // ==========================================================

  socket.on(
    'moderation:screen_share_request',
    (payload: { classId?: string }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('moderation:error', {
          message: 'classId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:screen_share_request',
        {
          classId,
          userId,
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: SCREEN SHARE APPROVED
  // ==========================================================

  socket.on(
    'moderation:screen_share_approved',
    (payload: {
      classId?: string;
      userId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:screen_share_approved',
        {
          classId,
          userId: payload.userId,
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: SCREEN SHARE REVOKED
  // ==========================================================

  socket.on(
    'moderation:screen_share_revoked',
    (payload: {
      classId?: string;
      userId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      io.to(`class:${classId}`).emit(
        'moderation:screen_share_revoked',
        {
          classId,
          userId: payload.userId,
        }
      );
    }
  );

  // ==========================================================
  // MODERATION: MUTE PARTICIPANT
  // ==========================================================

  socket.on(
    'moderation:mute_participant',
    async (payload: {
      classId?: string;
      userId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      try {
        await roomService.updateParticipant(
          classId,
          payload.userId,
          undefined,
          { canPublish: false }
        );

        io.to(`class:${classId}`).emit(
          'moderation:muted',
          {
            classId,
            userId: payload.userId,
          }
        );
      } catch (err) {
        console.error('[Moderation] Mute failed:', err);

        socket.emit('moderation:error', {
          message: 'Failed to mute participant',
        });
      }
    }
  );

  // ==========================================================
  // MODERATION: REMOVE PARTICIPANT
  // ==========================================================

  socket.on(
    'moderation:remove_participant',
    async (payload: {
      classId?: string;
      userId?: string;
    }) => {
      if (!isTeacher(roles)) {
        socket.emit('moderation:error', {
          message: 'Teacher only',
        });
        return;
      }

      const classId = payload?.classId;

      if (!classId || !payload?.userId) {
        socket.emit('moderation:error', {
          message: 'classId and userId required',
        });
        return;
      }

      try {
        await roomService.removeParticipant(
          classId,
          payload.userId
        );

        io.to(`class:${classId}`).emit(
          'moderation:removed',
          {
            classId,
            userId: payload.userId,
          }
        );
      } catch (err) {
        console.error('[Moderation] Remove failed:', err);

        socket.emit('moderation:error', {
          message: 'Failed to remove participant',
        });
      }
    }
  );

  // ==========================================================
  // CLASSROOM JOIN
  // ==========================================================

  socket.on(
    'CLASSROOM_JOIN',
    (payload: { classId?: string }) => {
      const classId = payload?.classId;

      if (!classId) {
        socket.emit('CLASSROOM_ERROR', {
          message: 'classId required',
        });
        return;
      }

      socket.join(`class:${classId}`);

      io.to(`class:${classId}`).emit(
        'CLASSROOM_PARTICIPANT_JOINED',
        {
          userId,
          classId,
        }
      );
    }
  );

  // ==========================================================
  // CLASSROOM LEAVE
  // ==========================================================

  socket.on(
    'CLASSROOM_LEAVE',
    (payload: { classId?: string }) => {
      const classId = payload?.classId;

      if (!classId) return;

      socket.leave(`class:${classId}`);

      io.to(`class:${classId}`).emit(
        'CLASSROOM_PARTICIPANT_LEFT',
        {
          userId,
          classId,
        }
      );
    }
  );

  // ==========================================================
  // DISCONNECT
  // ==========================================================

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', {
      socketId: socket.id,
      userId,
      reason,
    });
  });
});

// ============================================================
// SERVER START
// ============================================================

server.listen(config.port, () => {
  console.log(
    `olympiad-live-classroom-node listening on ${config.port}`
  );
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(signal: string) {
  console.log(`[Server] Received ${signal}. Shutting down...`);

  for (const question of questions.values()) {
    if (question.timer) {
      clearTimeout(question.timer);
    }
  }

  io.close();

  server.close(async () => {
    try {
      await pool.end();
      console.log('[Server] Shutdown complete');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Shutdown error:', err);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
