package com.olympiad.liveclass.dto;

import java.util.List;

/**
 * Minimal projection of the Identity Service {@code GET /api/auth/me} response.
 *
 * <p>Only the fields required to build a verified display name are mapped here.
 * Extra fields returned by Identity are ignored by Jackson.
 */
public record IdentityProfileResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        List<String> roles
) {

    /**
     * Builds a human display name from the verified profile.
     *
     * <p>Order: trimmed {@code firstName + lastName} -> email prefix -> null.
     * The caller is responsible for the final fallback when this returns null.
     */
    public String buildDisplayName() {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        if (!full.isEmpty()) {
            return full;
        }
        if (email != null && !email.isBlank()) {
            int at = email.indexOf('@');
            String prefix = (at > 0 ? email.substring(0, at) : email).trim();
            if (!prefix.isEmpty()) {
                return prefix;
            }
        }
        return null;
    }
}