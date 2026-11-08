
package com.olympiad.identity.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "role_permissions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_role_permissions_role_permission",
        columnNames = {"role_id", "permission_id"}
    )
)
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    protected RolePermission() {
    }

    public RolePermission(Role role, Permission permission) {
        this.role = role;
        this.permission = permission;
    }

    @PrePersist
    protected void onCreate() {
        assignedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public Role getRole() { return role; }
    public Permission getPermission() { return permission; }
    public Instant getAssignedAt() { return assignedAt; }
}
