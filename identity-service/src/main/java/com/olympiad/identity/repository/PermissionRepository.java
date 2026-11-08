
package com.olympiad.identity.repository;

import com.olympiad.identity.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PermissionRepository
        extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
