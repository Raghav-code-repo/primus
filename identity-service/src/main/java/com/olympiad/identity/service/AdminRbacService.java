
package com.olympiad.identity.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.olympiad.identity.entity.Permission;
import com.olympiad.identity.entity.Role;
import com.olympiad.identity.entity.RolePermission;
import com.olympiad.identity.entity.User;
import com.olympiad.identity.entity.UserRole;
import com.olympiad.identity.exception.ConflictException;
import com.olympiad.identity.exception.ResourceNotFoundException;
import com.olympiad.identity.model.UserStatus;
import com.olympiad.identity.repository.PermissionRepository;
import com.olympiad.identity.repository.RolePermissionRepository;
import com.olympiad.identity.repository.RoleRepository;
import com.olympiad.identity.repository.UserRepository;
import com.olympiad.identity.repository.UserRoleRepository;

@Service
public class AdminRbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public AdminRbacService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public List<Role> getRoles() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Permission> getPermissions() {
        return permissionRepository.findAll();
    }

    @Transactional
    public Role createRole(Map<String, String> request) {
        String name = request.get("name");

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Role name is required");
        }

        name = name.trim().toUpperCase();

        if (roleRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Role already exists: " + name);
        }

        Role role = new Role();
        role.setName(name);
        role.setDescription(request.get("description"));
        role.setActive(true);

        return roleRepository.save(role);
    }

    @Transactional
    public Permission createPermission(Map<String, String> request) {
        String code = request.get("code");

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Permission code is required");
        }

        code = code.trim().toUpperCase();

        if (permissionRepository.existsByCodeIgnoreCase(code)) {
            throw new ConflictException(
                    "Permission already exists: " + code);
        }

        Permission permission = new Permission();
        permission.setCode(code);
        permission.setDescription(request.get("description"));
        permission.setActive(true);

        return permissionRepository.save(permission);
    }

    @Transactional
    public void assignPermission(UUID roleId, UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Permission not found"));

        if (!role.isActive() || !permission.isActive()) {
            throw new ConflictException(
                    "Cannot assign an inactive role or permission");
        }

        if (rolePermissionRepository
                .existsByRole_IdAndPermission_Id(roleId, permissionId)) {
            throw new ConflictException(
                    "Permission is already assigned to this role");
        }

        rolePermissionRepository.save(
                new RolePermission(role, permission));
    }

    @Transactional
    public void revokePermission(UUID roleId, UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Permission not found"));

        if (!rolePermissionRepository
                .existsByRole_IdAndPermission_Id(roleId, permissionId)) {
            throw new ResourceNotFoundException(
                    "Permission is not assigned to this role");
        }

        rolePermissionRepository.deleteByRole_IdAndPermission_Id(
                roleId, permissionId);
    }

    @Transactional
    public void assignRole(UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ConflictException(
                    "Cannot assign a role to an inactive user");
        }

        if (!role.isActive()) {
            throw new ConflictException(
                    "Cannot assign an inactive role");
        }

        if (userRoleRepository.existsByUser_IdAndRole_Id(userId, roleId)) {
            throw new ConflictException(
                    "Role is already assigned to this user");
        }

        userRoleRepository.save(new UserRole(user, role));
    }

    @Transactional
    public void revokeRole(UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        if (!userRoleRepository.existsByUser_IdAndRole_Id(userId, roleId)) {
            throw new ResourceNotFoundException(
                    "Role is not assigned to this user");
        }

        if ("ADMIN".equalsIgnoreCase(role.getName())) {
            long activeAdminCount = userRoleRepository.findByRole_Id(roleId)
                    .stream()
                    .filter(ur ->
                            ur.getUser().getStatus() == UserStatus.ACTIVE)
                    .count();

            if (activeAdminCount <= 1
                    && user.getStatus() == UserStatus.ACTIVE) {
                throw new ConflictException(
                        "Cannot remove the last active administrator");
            }
        }

        userRoleRepository.deleteByUser_IdAndRole_Id(userId, roleId);
    }
}
