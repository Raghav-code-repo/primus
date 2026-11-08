package com.olympiad.identity.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.olympiad.identity.dto.AuthResponse;
import com.olympiad.identity.dto.LoginRequest;
import com.olympiad.identity.dto.RegisterRequest;
import com.olympiad.identity.dto.request.ChangePasswordRequest;
import com.olympiad.identity.dto.request.ForgotPasswordRequest;
import com.olympiad.identity.dto.request.ResetPasswordRequest;
import com.olympiad.identity.entity.PasswordResetToken;
import com.olympiad.identity.entity.Role;
import com.olympiad.identity.entity.User;
import com.olympiad.identity.entity.UserRole;
import com.olympiad.identity.model.UserStatus;
import com.olympiad.identity.repository.PasswordResetTokenRepository;
import com.olympiad.identity.repository.RoleRepository;
import com.olympiad.identity.repository.UserRepository;
import com.olympiad.identity.repository.UserRoleRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long resetTokenExpiryMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${security.password-reset.expiration-ms:3600000}") long resetTokenExpiryMs) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetTokenExpiryMs = resetTokenExpiryMs;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Role studentRole = roleRepository.findByNameIgnoreCase("STUDENT")
                .orElseThrow(() -> new IllegalStateException(
                        "STUDENT role is missing. Check your role seed migration."));

        User user = new User(
                email,
                passwordEncoder.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim());

        User savedUser = userRepository.save(user);

        userRoleRepository.save(new UserRole(savedUser, studentRole));

        return createAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "This account is not active");
        }

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserProfile getProfile(String email) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        List<String> roles = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(userRole -> userRole.getRole().getName())
                .distinct()
                .toList();

        return toProfile(user, roles);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
            String tokenHash = hashToken(token);

            PasswordResetToken resetToken = new PasswordResetToken(
                    user,
                    tokenHash,
                    Instant.now().plusMillis(resetTokenExpiryMs));
            passwordResetTokenRepository.save(resetToken);
            // Token is not returned in response; local testing may log if needed - not logged here
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.getUsedAt() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to hash reset token", ex);
        }
    }

    private AuthResponse createAuthResponse(User user) {

        List<String> roles = userRoleRepository.findByUser_Id(user.getId())
                .stream()
                .map(userRole -> userRole.getRole().getName())
                .distinct()
                .toList();

        String token = jwtService.generateToken(
                user.getId(), user.getEmail(), roles);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs() / 1000,
                toProfile(user, roles));
    }

    private AuthResponse.UserProfile toProfile(
            User user, List<String> roles) {

        return new AuthResponse.UserProfile(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}