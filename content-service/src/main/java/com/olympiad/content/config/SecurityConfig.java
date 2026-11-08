
package com.olympiad.content.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Base64;

@Configuration
public class SecurityConfig {

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    /**
     * Validates HS256 JWTs issued by the Identity Service.
     * JWT_SECRET must be the same Base64-encoded secret used by Identity Service.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must decode to at least 32 bytes for HS256."
            );
        }

        SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");

        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    /**
     * Maps JWT authorities and roles into Spring Security authorities.
     *
     * Example claims:
     * "authorities": ["CONTENT_READ", "CONTENT_CREATE"]
     * "roles": ["STUDENT", "FACULTY"]
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                new ContentJwtAuthoritiesConverter()
        );

        return converter;
    }

    /**
     * Swagger and health are public.
     * Content APIs require JWT authentication and appropriate RBAC authorities.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Swagger UI and OpenAPI documentation
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**"
                ).permitAll()

                // Application health endpoints
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/health/**"
                ).permitAll()

                // Allow browser CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Read lessons and content resources
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/content/lessons",
                    "/api/content/lessons/**"
                ).hasAnyAuthority(
                    "CONTENT_READ",
                    "ROLE_STUDENT",
                    "ROLE_FACULTY",
                    "ROLE_ADMIN"
                )

                // Create lessons and content resources
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/content/lessons",
                    "/api/content/lessons/**"
                ).hasAnyAuthority(
                    "CONTENT_CREATE",
                    "ROLE_FACULTY",
                    "ROLE_ADMIN"
                )

                // Update lessons and content resources
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/content/lessons",
                    "/api/content/lessons/**"
                ).hasAnyAuthority(
                    "CONTENT_UPDATE",
                    "ROLE_ADMIN"
                )

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/content/lessons",
                    "/api/content/lessons/**"
                ).hasAnyAuthority(
                    "CONTENT_UPDATE",
                    "ROLE_ADMIN"
                )

                // Delete lessons and content resources
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/content/lessons",
                    "/api/content/lessons/**"
                ).hasAnyAuthority(
                    "CONTENT_DELETE",
                    "ROLE_ADMIN"
                )

                // Protect any other API endpoints by default
                .anyRequest().authenticated()
            )

            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter)
                )
            );

        return http.build();
    }

    /**
     * Converts permission claims directly and adds ROLE_ to role claims
     * when the prefix is not already present.
     */
    static class ContentJwtAuthoritiesConverter
            implements Converter<Jwt, Collection<GrantedAuthority>> {

        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            List<GrantedAuthority> authorities = new ArrayList<>();

            addAuthorities(authorities, jwt.getClaims().get("authorities"), false);
            addAuthorities(authorities, jwt.getClaims().get("roles"), true);

            return authorities;
        }

        private void addAuthorities(
                List<GrantedAuthority> result,
                Object claimValue,
                boolean roleClaim) {

            if (!(claimValue instanceof Collection<?> values)) {
                return;
            }

            for (Object value : values) {
                if (!(value instanceof String name) || name.isBlank()) {
                    continue;
                }

                String authority = name.trim();

                if (roleClaim && !authority.startsWith("ROLE_")) {
                    authority = "ROLE_" + authority;
                }

                result.add(new SimpleGrantedAuthority(authority));
            }
        }
    }
}
