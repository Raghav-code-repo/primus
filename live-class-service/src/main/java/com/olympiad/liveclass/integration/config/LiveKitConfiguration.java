package com.olympiad.liveclass.integration.config;

import io.livekit.server.RoomServiceClient;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(LiveKitProperties.class)
public class LiveKitConfiguration {

    @Bean
    public RoomServiceClient roomServiceClient(
            LiveKitProperties properties) {

        return RoomServiceClient.createClient(
                properties.getUrl(),
                properties.getApiKey(),
                properties.getApiSecret()
        );
    }
}