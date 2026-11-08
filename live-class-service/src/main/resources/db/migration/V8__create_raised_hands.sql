CREATE TABLE raised_hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_class_id UUID NOT NULL REFERENCES live_classes(id),
    user_id UUID NOT NULL,
    raised_at TIMESTAMP NOT NULL DEFAULT NOW(),
    cleared_at TIMESTAMP,
    accepted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_raised_hands_live_class ON raised_hands(live_class_id);
CREATE INDEX idx_raised_hands_user ON raised_hands(user_id);
