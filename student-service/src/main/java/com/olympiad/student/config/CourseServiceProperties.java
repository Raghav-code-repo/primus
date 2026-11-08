package com.olympiad.student.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration of the service to service calls against the Course Service.
 *
 * <p>{@code baseUrl} points to the Course Service (port 8081 by default).
 * {@code token} is optional: when it is set it is used as the bearer token of
 * the service to service calls, which allows the Student Service to act with
 * a dedicated service account instead of forwarding the end user token.
 * When it is empty the token of the incoming request is forwarded instead.
 */
@ConfigurationProperties(prefix = "course.service")
public class CourseServiceProperties {

    /** Base URL of the Course Service. */
    private String baseUrl = "http://localhost:8081";

    /** Optional trusted service account token used for Course Service calls. */
    private String token;

    /** Connect timeout for Course Service calls. */
    private Duration connectTimeout = Duration.ofSeconds(3);

    /** Read timeout for Course Service calls. */
    private Duration readTimeout = Duration.ofSeconds(5);

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Duration getConnectTimeout() {
        return connectTimeout;
    }

    public void setConnectTimeout(Duration connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    public Duration getReadTimeout() {
        return readTimeout;
    }

    public void setReadTimeout(Duration readTimeout) {
        this.readTimeout = readTimeout;
    }
}
