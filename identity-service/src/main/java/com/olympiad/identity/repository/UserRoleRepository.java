
package com.olympiad.identity.repository;

import com.olympiad.identity.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserRoleRepository
        extends JpaRepository<UserRole, UUID> {

    List<UserRole> findByUser_Id(UUID userId);

    List<UserRole> findByRole_Id(UUID roleId);

    boolean existsByUser_IdAndRole_Id(UUID userId, UUID roleId);

    void deleteByUser_IdAndRole_Id(UUID userId, UUID roleId);
}
