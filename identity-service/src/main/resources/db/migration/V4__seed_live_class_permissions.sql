INSERT INTO permissions (id, code, description, active, created_at)
VALUES
    (gen_random_uuid(), 'LIVE_CLASS_READ', 'Read live classes', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_CREATE', 'Create live classes', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_UPDATE', 'Update live classes', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_CANCEL', 'Cancel live classes', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_JOIN', 'Join live classes', TRUE, NOW()),
    (gen_random_uuid(), 'LIVE_CLASS_ATTENDANCE_READ', 'Read live class attendance', TRUE, NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'STUDENT' AND p.code IN ('LIVE_CLASS_READ', 'LIVE_CLASS_JOIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'TEACHER' AND p.code LIKE 'LIVE_CLASS_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (id, role_id, permission_id, assigned_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.code LIKE 'LIVE_CLASS_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;
