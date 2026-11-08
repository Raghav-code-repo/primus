
package com.olympiad.identity.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "roles",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_roles_name", columnNames = "name"
    )
)
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Role() {
    }

    public Role(String name, String description) {
        this.name = name;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setActive(boolean active) { this.active = active; }
}
