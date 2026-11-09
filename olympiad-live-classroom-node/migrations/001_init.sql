CREATE TABLE IF NOT EXISTS classroom_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_classroom ON classroom_chat_messages(classroom_id, created_at);
