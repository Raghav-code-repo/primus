
package com.olympiad.identity.repository;

import com.olympiad.identity.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RolePermissionRepository
        extends JpaRepository<RolePermission, UUID> {

    List<RolePermission> findByRole_Id(UUID roleId);

    List<RolePermission> findByPermission_Id(UUID permissionId);

    boolean existsByRole_IdAndPermission_Id(
        UUID roleId, UUID permissionId
    );

    void deleteByRole_IdAndPermission_Id(
        UUID roleId, UUID permissionId
    );
}
