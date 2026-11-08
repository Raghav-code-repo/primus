
package com.olympiad.liveclass.config;

import com.olympiad.liveclass.security.StompAuthChannelInterceptor;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor authInterceptor;

    public WebSocketConfig(StompAuthChannelInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Raw WebSocket STOMP endpoint. The browser connects via a native
        // WebSocket and sends the Identity JWT in the STOMP CONNECT headers;
        // StompAuthChannelInterceptor validates it. SockJS is intentionally not
        // used because its initial HTTP handshake cannot carry a bearer token
        // and is rejected by Spring Security (transport-level auth), which
        // breaks "HTTP Authentication failed; no valid credentials available".
        registry.addEndpoint("/live-class-ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(
            org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(authInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/user");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
