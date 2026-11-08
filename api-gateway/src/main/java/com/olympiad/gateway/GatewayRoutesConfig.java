
package com.olympiad.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    private final String identityUrl;
    private final String courseUrl;
    private final String studentUrl;
    private final String contentUrl;
    private final String liveClassUrl;

    public GatewayRoutesConfig(
            @Value("${app.services.identity-url}") String identityUrl,
            @Value("${app.services.course-url}") String courseUrl,
            @Value("${app.services.student-url}") String studentUrl,
            @Value("${app.services.content-url}") String contentUrl,
            @Value("${app.services.live-class}") String liveClassUrl) {
        this.identityUrl = identityUrl;
        this.courseUrl = courseUrl;
        this.studentUrl = studentUrl;
        this.contentUrl = contentUrl;
        this.liveClassUrl = liveClassUrl;
    }

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()

            // Identity Service: authentication and current-user APIs
            .route("identity-service", route -> route
                .path("/api/auth/**")
                .uri(identityUrl))

            // Identity Service: admin users, roles, and permissions
            .route("identity-admin-service", route -> route
                .path("/api/admin/**")
                .uri(identityUrl))

            // Course Service
            .route("course-service", route -> route
                .path("/api/courses/**")
                .uri(courseUrl))

            // Student Service
            .route("student-service", route -> route
                .path("/api/students/**")
                .uri(studentUrl))

            // Enrollment APIs hosted by Student Service
            .route("enrollment-service", route -> route
                .path("/api/enrollments/**")
                .uri(studentUrl))
            
            // Content Service API
            .route("content-service", route -> route
            	    .path("/api/content/**")
            	    .uri(contentUrl))

            // Live Class Service
            .route("live-class-service", route -> route
                .path("/api/live-classes/**")
                .uri(liveClassUrl))

            .build();
    }
}


