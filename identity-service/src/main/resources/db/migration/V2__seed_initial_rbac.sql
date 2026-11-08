
INSERT INTO roles (id, name, description, active, created_at)
VALUES
    (gen_random_uuid(), 'STUDENT', 'Student access', TRUE, NOW()),
    (gen_random_uuid(), 'TEACHER', 'Teacher access', TRUE, NOW()),
    (gen_random_uuid(), 'ADMIN', 'Administrator access', TRUE, NOW());

INSERT INTO permissions (id, code, description, active, created_at)
VALUES
    (gen_random_uuid(), 'USER_READ', 'Read user details', TRUE, NOW()),
    (gen_random_uuid(), 'USER_CREATE', 'Create users', TRUE, NOW()),
    (gen_random_uuid(), 'USER_UPDATE', 'Update users', TRUE, NOW()),
    (gen_random_uuid(), 'USER_DELETE', 'Delete users', TRUE, NOW()),
    (gen_random_uuid(), 'ROLE_ASSIGN', 'Assign roles to users', TRUE, NOW()),
    (gen_random_uuid(), 'PERMISSION_MANAGE', 'Manage role permissions', TRUE, NOW());
