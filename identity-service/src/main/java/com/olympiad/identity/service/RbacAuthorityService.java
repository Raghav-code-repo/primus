package com.olympiad.identity.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.olympiad.identity.entity.Role;
import com.olympiad.identity.entity.RolePermission;
import com.olympiad.identity.entity.User;
import com.olympiad.identity.entity.UserRole;
import com.olympiad.identity.model.UserStatus;
import com.olympiad.identity.repository.RolePermissionRepository;
import com.olympiad.identity.repository.UserRepository;
import com.olympiad.identity.repository.UserRoleRepository;

@Service
public class RbacAuthorityService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public RbacAuthorityService(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public List<GrantedAuthority> loadAuthorities(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("User account is not active");
        }

        Set<String> authorityNames = new HashSet<>();

        List<UserRole> userRoles =
                userRoleRepository.findByUser_Id(user.getId());

        for (UserRole userRole : userRoles) {
            Role role = userRole.getRole();

            if (role == null || !role.isActive()) {
                continue;
            }

            // Spring's hasRole("ADMIN") checks for ROLE_ADMIN.
            authorityNames.add("ROLE_" + role.getName());

            List<RolePermission> rolePermissions =
                    rolePermissionRepository.findByRole_Id(role.getId());

            for (RolePermission rolePermission : rolePermissions) {
                if (rolePermission.getPermission() == null
                        || !rolePermission.getPermission().isActive()) {
                    continue;
                }
                String permissionCode =
                        rolePermission.getPermission().getCode();

                if (permissionCode != null) {
                    authorityNames.add(permissionCode);
                }
            }
        }

        return authorityNames.stream()
                .map(SimpleGrantedAuthority::new)
                .map(authority -> (GrantedAuthority) authority)
                .toList();
    }
}