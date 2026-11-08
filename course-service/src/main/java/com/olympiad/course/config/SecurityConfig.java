
package com.olympiad.course.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter(
            CurrentAuthoritiesConverter currentAuthoritiesConverter) {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        // Resolve current authorities using the existing
        // CurrentAuthoritiesConverter implementation.
        converter.setJwtGrantedAuthoritiesConverter(
                currentAuthoritiesConverter);

        return converter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(
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

                // Read courses
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAuthority("COURSE_READ")

                // Create courses
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAuthority("COURSE_CREATE")

                // Update courses
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAuthority("COURSE_UPDATE")

                // Partially update courses
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAuthority("COURSE_UPDATE")

                // Delete courses
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/courses",
                    "/api/courses/**"
                ).hasAuthority("COURSE_DELETE")

                // All remaining endpoints require authentication.
                .anyRequest().authenticated()
            )

            // Preserve JWT resource-server authentication.
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter
                    )
                )
            );

        return http.build();
    }
}
