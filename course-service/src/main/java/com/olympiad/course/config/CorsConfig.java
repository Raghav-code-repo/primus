package com.olympiad.course.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS configuration for the browser clients of the Course Service.
 *
 * The frontend (Olympiad Learning Academy, http://localhost:5173) calls this
 * API on a different origin, so the browser performs a preflight request for
 * every call that carries the Authorization or Content-Type header.
 *
 * The configuration only adds response headers to browser requests. It does not
 * change the JWT decoder, the authority lookup against the Identity Service,
 * the authorization rules or the database.
 *
 * The allowed origins are configurable with the property
 * {@code app.cors.allowed-origins} (comma separated), so no code change is
 * needed to allow another frontend origin.
 */
@Configuration
public class CorsConfig {

    private final List<String> allowedOrigins;

    public CorsConfig(
            @Value("${app.cors.allowed-origins:http://localhost:5173}")
            String allowedOrigins) {

        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Explicit origins, never "*", so that the configuration stays valid if
        // credentials are enabled later on.
        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"));

        // Authorization is required for the bearer token, Content-Type for the
        // JSON request bodies, both need preflight permission.
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"));

        configuration.setExposedHeaders(List.of("Location"));

        // The API authenticates with a bearer token, no cookie is used.
        configuration.setAllowCredentials(false);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
