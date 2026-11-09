import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigins, credentials: true }));
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'olympiad-live-classroom-node', port: config.port }));

  app.post('/internal/classrooms/:classId/session', (req, res) => {
    const token = req.header('x-internal-token');
    const expected = process.env.INTERNAL_SERVICE_TOKEN ?? 'dev-internal-token';
    if (!token || token !== expected) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const classId = req.params.classId;
    return res.json({
      classId,
      sessionId: `session-${classId}`,
      websocketUrl: `ws://localhost:${config.port}`,
      createdAt: new Date().toISOString(),
    });
  });

  return app;
}

