
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_permissions_code UNIQUE (code)
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT uk_user_roles_user_role
        UNIQUE (user_id, role_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(id),
    CONSTRAINT uk_role_permissions_role_permission
        UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_user_roles_user_id
    ON user_roles(user_id);

CREATE INDEX idx_user_roles_role_id
    ON user_roles(role_id);

CREATE INDEX idx_role_permissions_role_id
    ON role_permissions(role_id);

CREATE INDEX idx_role_permissions_permission_id
    ON role_permissions(permission_id);
