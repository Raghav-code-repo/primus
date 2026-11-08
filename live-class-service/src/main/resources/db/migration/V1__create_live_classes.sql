
CREATE TABLE live_classes (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    room_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_live_class_time
        CHECK (scheduled_end > scheduled_start),

    CONSTRAINT chk_live_class_status
        CHECK (status IN (
            'SCHEDULED',
            'LIVE',
            'COMPLETED',
            'CANCELLED'
        ))
);

CREATE INDEX idx_live_classes_teacher
    ON live_classes (teacher_id);

CREATE INDEX idx_live_classes_schedule
    ON live_classes (scheduled_start);

CREATE INDEX idx_live_classes_course
    ON live_classes (course_id);
