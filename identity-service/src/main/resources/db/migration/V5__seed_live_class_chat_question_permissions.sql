
INSERT INTO permissions (id, code, description, active, created_at)
VALUES
    (gen_random_uuid(), 'LIVE_CLASS_CHAT_READ', 'Read live class chat messages', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_CHAT_SEND', 'Send live class chat messages', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_QUESTION_READ', 'Read live class questions', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_QUESTION_CONTROL', 'Start, end, and control live class questions', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_ANSWER_REVEAL', 'Reveal live class question answers', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_ANSWER_SUBMIT', 'Submit answers to live class questions', TRUE, NOW())
ON CONFLICT (code) DO NOTHING;

-- STUDENT: chat read/send, question read, answer submit
INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'STUDENT' AND p.code IN (
    'LIVE_CLASS_CHAT_READ',
    'LIVE_CLASS_CHAT_SEND',
    'LIVE_CLASS_QUESTION_READ',
    'LIVE_CLASS_ANSWER_SUBMIT'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- TEACHER: chat read/send, question read/control, answer reveal/submit
INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'TEACHER' AND p.code IN (
    'LIVE_CLASS_CHAT_READ',
    'LIVE_CLASS_CHAT_SEND',
    'LIVE_CLASS_QUESTION_READ',
    'LIVE_CLASS_QUESTION_CONTROL',
    'LIVE_CLASS_ANSWER_REVEAL',
    'LIVE_CLASS_ANSWER_SUBMIT'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN: already covered by V4 LIKE 'LIVE_CLASS_%'; ensure explicit coverage too
INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code LIKE 'LIVE_CLASS_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;
