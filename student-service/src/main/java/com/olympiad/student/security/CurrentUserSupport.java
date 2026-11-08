package com.olympiad.student.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Helpers around the authenticated principal.
 *
 * <p>The Identity Service issues tokens with the {@code userId} claim holding
 * the stable user id (see Identity Service {@code JwtService#generateToken}).
 * The student identity of a request is always taken from that claim, never
 * from the request body.
 */
public final class CurrentUserSupport {

    /** Claim holding the stable Identity Service user id. */
    public static final String USER_ID_CLAIM = "userId";

    private CurrentUserSupport() {
    }

    /**
     * Returns the stable Identity user id of the given token.
     */
    public static String userId(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        return jwt.getClaimAsString(USER_ID_CLAIM);
    }

    /**
     * Returns the stable Identity user id of the given authentication, or
     * null when the authentication does not carry a JWT.
     */
    public static String userId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            return userId(jwt);
        }

        return null;
    }

    /**
     * Returns the bearer token of the given token.
     */
    public static String token(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        return jwt.getTokenValue();
    }

    /**
     * Returns the bearer token of the given authentication, or null when the
     * authentication does not carry a JWT.
     */
    public static String token(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            return jwt.getTokenValue();
        }

        return null;
    }

    /**
     * Returns true when the authentication carries one of the given
     * authorities.
     */
    public static boolean hasAnyAuthority(
            Authentication authentication, String... authorities) {

        if (authentication == null) {
            return false;
        }

        for (GrantedAuthority granted : authentication.getAuthorities()) {
            for (String authority : authorities) {
                if (authority.equals(granted.getAuthority())) {
                    return true;
                }
            }
        }

        return false;
    }
}
