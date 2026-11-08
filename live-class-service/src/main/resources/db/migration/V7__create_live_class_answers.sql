
CREATE TABLE live_class_answers (
    id UUID PRIMARY KEY,
    question_session_id UUID NOT NULL REFERENCES live_class_question_sessions(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL,
    option_index INTEGER,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_correct BOOLEAN,
    points_awarded INTEGER DEFAULT 0,

    CONSTRAINT uq_answer_student_session UNIQUE (question_session_id, student_user_id)
);

CREATE INDEX idx_answers_session ON live_class_answers (question_session_id);
CREATE INDEX idx_answers_student ON live_class_answers (student_user_id);
