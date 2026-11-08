CREATE TABLE courses (
    id UUID PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uk_courses_code UNIQUE (code),
    CONSTRAINT chk_courses_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_courses_subject
    ON courses(subject);

CREATE INDEX idx_courses_grade_level
    ON courses(grade_level);

CREATE INDEX idx_courses_status
    ON courses(status);