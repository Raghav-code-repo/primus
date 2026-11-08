package com.olympiad.identity.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.olympiad.identity.entity.PasswordResetToken;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(Instant time);
}
