CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL,
    recipient_user_id UUID,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_class ON chat_messages (live_class_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages (sender_user_id);
CREATE INDEX idx_chat_messages_recipient ON chat_messages (recipient_user_id);
