package com.olympiad.liveclass.integration.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "livekit")
public class LiveKitProperties {

    private String url;
    private String apiKey;
    private String apiSecret;
    private String wsUrl;
    private long tokenTtlMillis = 1800000;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }

    public String getWsUrl() {
        return wsUrl;
    }

    public void setWsUrl(String wsUrl) {
        this.wsUrl = wsUrl;
    }

    public long getTokenTtlMillis() {
        return tokenTtlMillis;
    }

    public void setTokenTtlMillis(long tokenTtlMillis) {
        this.tokenTtlMillis = tokenTtlMillis;
    }
}