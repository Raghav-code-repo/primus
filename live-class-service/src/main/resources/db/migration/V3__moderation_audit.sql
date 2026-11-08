CREATE TABLE moderation_audit (
    id UUID PRIMARY KEY,
    live_class_id UUID NOT NULL,
    teacher_user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
