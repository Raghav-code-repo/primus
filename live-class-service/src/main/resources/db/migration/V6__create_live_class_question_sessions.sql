
CREATE TABLE live_class_question_sessions (
    id UUID PRIMARY KEY,
    live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES live_class_questions(id) ON DELETE CASCADE,
    started_by UUID NOT NULL,
    started_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 300,
    ends_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    answer_revealed_at TIMESTAMPTZ,

    CONSTRAINT chk_session_status CHECK (status IN (
        'NOT_STARTED',
        'ACTIVE',
        'ENDED',
        'ANSWER_REVEALED'
    )),
    CONSTRAINT chk_session_duration CHECK (duration_seconds > 0 AND duration_seconds <= 3600)
);

CREATE INDEX idx_sessions_class ON live_class_question_sessions (live_class_id);
CREATE INDEX idx_sessions_status ON live_class_question_sessions (status);
