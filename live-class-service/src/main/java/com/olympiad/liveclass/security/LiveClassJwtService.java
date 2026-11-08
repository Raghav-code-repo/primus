
package com.olympiad.liveclass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Service
public class LiveClassJwtService {

    private final SecretKey signingKey;

    public LiveClassJwtService(
            @Value("${security.jwt.secret}") String secret
    ) {
        this.signingKey =
                Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserId(Claims claims) {
        return claims.get("userId", String.class);
    }

    public String getEmail(Claims claims) {
        return claims.getSubject();
    }

    public Set<String> getRoles(Claims claims) {
        return readStrings(claims.get("roles"));
    }

    /*
     * Identity must issue a permissions claim, or the token must
     * contain an authorities claim with permission codes.
     * Never infer permissions from role names.
     */
    public Set<String> getPermissions(Claims claims) {
        Set<String> permissions =
                readStrings(claims.get("permissions"));

        if (permissions.isEmpty()) {
            permissions = readStrings(claims.get("authorities"))
                    .stream()
                    .filter(value -> value.startsWith("LIVE_CLASS_"))
                    .collect(java.util.stream.Collectors.toSet());
        }

        return permissions;
    }

    private Set<String> readStrings(Object value) {
        if (!(value instanceof Collection<?> collection)) {
            return Set.of();
        }

        return collection.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }
}
