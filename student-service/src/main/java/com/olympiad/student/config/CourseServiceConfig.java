package com.olympiad.student.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import com.olympiad.student.client.CourseServiceClient;
import com.olympiad.student.client.HttpCourseServiceClient;

/**
 * Wiring of the Course Service client.
 */
@Configuration
@EnableConfigurationProperties(CourseServiceProperties.class)
public class CourseServiceConfig {

    @Bean
    public RestClient courseServiceRestClient(
            CourseServiceProperties properties) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(properties.getConnectTimeout());
        requestFactory.setReadTimeout(properties.getReadTimeout());

        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    @Bean
    public CourseServiceClient courseServiceClient(
            RestClient courseServiceRestClient,
            CourseServiceProperties properties) {

        return new HttpCourseServiceClient(
                courseServiceRestClient, properties);
    }
}
