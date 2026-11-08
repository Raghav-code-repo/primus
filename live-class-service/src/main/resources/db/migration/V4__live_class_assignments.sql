CREATE TABLE live_class_assignments (
    id UUID PRIMARY KEY,
    live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_live_class_student UNIQUE (live_class_id, student_id)
);
CREATE INDEX idx_lca_class ON live_class_assignments (live_class_id);
CREATE INDEX idx_lca_student ON live_class_assignments (student_id);
