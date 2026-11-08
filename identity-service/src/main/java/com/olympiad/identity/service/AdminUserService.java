package com.olympiad.identity.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.olympiad.identity.dto.request.CreateUserRequest;
import com.olympiad.identity.dto.request.UpdateUserRequest;
import com.olympiad.identity.dto.response.UserResponse;
import com.olympiad.identity.entity.User;
import com.olympiad.identity.entity.UserRole;
import com.olympiad.identity.model.UserStatus;
import com.olympiad.identity.exception.ConflictException;
import com.olympiad.identity.exception.ResourceNotFoundException;
import com.olympiad.identity.repository.RoleRepository;
import com.olympiad.identity.repository.UserRepository;
import com.olympiad.identity.repository.UserRoleRepository;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.email().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(false);

        User saved = userRepository.save(user);

        // New users receive no administrative roles automatically.
        return toResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUser(id);

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateStatus(
            UUID id, UserStatus status, String actorEmail) {

        User user = findUser(id);

        // Do not allow an administrator to disable their own account.
        if (actorEmail != null
                && user.getEmail().equalsIgnoreCase(actorEmail)
                && status != UserStatus.ACTIVE) {
            throw new ConflictException(
                    "You cannot deactivate or lock your own account");
        }

        if (status != UserStatus.ACTIVE) {
            long activeAdminCount = userRoleRepository.findByUser_Id(id)
                    .stream()
                    .map(UserRole::getRole)
                    .filter(role -> role != null
                            && role.isActive()
                            && "ADMIN".equalsIgnoreCase(role.getName()))
                    .count();

            if (activeAdminCount > 0) {
                long totalActiveAdmins = userRoleRepository.findAll().stream()
                        .filter(ur -> ur.getUser() != null
                                && ur.getUser().getStatus() == UserStatus.ACTIVE
                                && ur.getRole() != null
                                && ur.getRole().isActive()
                                && "ADMIN".equalsIgnoreCase(ur.getRole().getName()))
                        .map(ur -> ur.getUser().getId())
                        .distinct()
                        .count();

                if (totalActiveAdmins <= 1) {
                    throw new ConflictException(
                            "Cannot deactivate or lock the last active administrator");
                }
            }
        }

        user.setStatus(status);
        return toResponse(userRepository.save(user));
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private UserResponse toResponse(User user) {
        List<String> roleNames = userRoleRepository
                .findByUser_Id(user.getId())
                .stream()
                .map(UserRole::getRole)
                .map(role -> role.getName())
                .distinct()
                .sorted()
                .toList();

        return UserResponse.from(user, roleNames);
    }
}