-- Reference DDL of the enrollment table of the Student Service.
--
-- The Student Service manages its schema with Hibernate
-- (spring.jpa.hibernate.ddl-auto=update), this script documents the result of
-- the Enrollment entity mapping. Run it manually when the schema is managed
-- outside of Hibernate (spring.jpa.hibernate.ddl-auto=none or validate).
--
-- The course itself is owned by the Course Service and therefore only the
-- course id is stored here, no foreign key to the course table exists.

CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    identity_user_id VARCHAR(64) NOT NULL,
    student_profile_id BIGINT,
    course_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_enrollment_student_course
        UNIQUE (identity_user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_identity_user_id
    ON enrollments (identity_user_id);

CREATE INDEX IF NOT EXISTS idx_enrollment_course_id
    ON enrollments (course_id);
