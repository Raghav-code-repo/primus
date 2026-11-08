
package com.olympiad.student.config;

import java.util.Base64;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    static final String ROLE_PREFIX = "ROLE_";

    @Value("${spring.security.oauth2.resourceserver.jwt.secret-key}")
    private String jwtSecretBase64;

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecretBase64);

        // Must match the Identity Service signing key and HS256 algorithm.
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");

        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter)
            throws Exception {

        http
            // CORS is handled centrally by the API Gateway.
            .cors(AbstractHttpConfigurer::disable)

            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth
                // Public API documentation
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()

                // All other endpoints require a valid JWT.
                .anyRequest().authenticated()
            )

            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter
                    )
                )
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                jwtAuthoritiesConverter()
        );

        return converter;
    }

    /**
     * Maps JWT roles and permissions to Spring Security authorities.
     *
     * Role values support both STUDENT and ROLE_STUDENT conventions.
     * Permission values are preserved exactly as supplied.
     */
    Converter<Jwt, Collection<GrantedAuthority>>
            jwtAuthoritiesConverter() {

        return jwt -> {
            Map<String, Object> claims = jwt.getClaims();
            Set<String> authorityNames = new LinkedHashSet<>();

            readClaim(claims, "roles").forEach(authorityNames::add);
            readClaim(claims, "permissions").forEach(authorityNames::add);
            readClaim(claims, "authorities").forEach(authorityNames::add);

            return authorityNames.stream()
                    .map(SimpleGrantedAuthority::new)
                    .map(GrantedAuthority.class::cast)
                    .toList();
        };
    }

    /**
     * Reads a claim containing either a collection of strings or a single string.
     * Adds the original value and its ROLE_-prefixed variant.
     */
    private List<String> readClaim(
            Map<String, Object> claims,
            String claimName) {

        Object claim = claims.get(claimName);

        if (claim instanceof Collection<?> values) {
            return values.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .flatMap(value ->
                        Stream.of(value, rolePrefixed(value))
                    )
                    .distinct()
                    .toList();
        }

        if (claim instanceof String single) {
            return Stream.of(single, rolePrefixed(single))
                    .distinct()
                    .toList();
        }

        return List.of();
    }

    /**
     * Adds ROLE_ only when it is not already present.
     */
    private String rolePrefixed(String value) {
        if (value.startsWith(ROLE_PREFIX)) {
            return value;
        }

        return ROLE_PREFIX + value;
    }
}
