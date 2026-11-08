
package com.olympiad.liveclass.config;

import com.olympiad.liveclass.security.ApiSecurityHandlers;
import com.olympiad.liveclass.security.LiveClassJwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final LiveClassJwtAuthenticationFilter jwtFilter;
    private final ApiSecurityHandlers securityHandlers;

    public SecurityConfig(
            LiveClassJwtAuthenticationFilter jwtFilter,
            ApiSecurityHandlers securityHandlers
    ) {
        this.jwtFilter = jwtFilter;
        this.securityHandlers = securityHandlers;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(securityHandlers)
                        .accessDeniedHandler(securityHandlers)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // The WebSocket transport connection must be established
                        // before the STOMP CONNECT frame carries the Identity JWT.
                        // Authentication is enforced at the STOMP CONNECT level by
                        // StompAuthChannelInterceptor, not at the transport level.
                        .requestMatchers("/live-class-ws").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }
}
