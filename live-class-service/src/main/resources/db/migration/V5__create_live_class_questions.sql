
CREATE TABLE live_class_questions (
    id UUID PRIMARY KEY,
    live_class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    statement TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option INTEGER,
    explanation TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_question_options CHECK (options IS NOT NULL)
);

CREATE INDEX idx_questions_class ON live_class_questions (live_class_id);
CREATE INDEX idx_questions_subject ON live_class_questions (subject);
