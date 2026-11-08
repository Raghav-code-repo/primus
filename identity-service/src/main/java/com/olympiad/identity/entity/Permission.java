
package com.olympiad.identity.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "permissions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_permissions_code", columnNames = "code"
    )
)
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Permission() {
    }

    public Permission(String code, String description) {
        this.code = code;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setCode(String code) { this.code = code; }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setActive(boolean active) { this.active = active; }
}
