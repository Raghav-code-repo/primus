
package com.olympiad.identity.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "user_roles",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_roles_user_role",
        columnNames = {"user_id", "role_id"}
    )
)
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    protected UserRole() {
    }

    public UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        assignedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public Role getRole() { return role; }
    public Instant getAssignedAt() { return assignedAt; }
}
