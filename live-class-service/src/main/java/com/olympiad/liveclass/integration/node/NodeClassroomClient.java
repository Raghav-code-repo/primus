package com.olympiad.liveclass.integration.node;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class NodeClassroomClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String internalToken;

    public NodeClassroomClient(
            @Value("${node-classroom.base-url:http://localhost:8091}") String baseUrl,
            @Value("${node-classroom.internal-token:}") String internalToken) {
        this.restTemplate = new RestTemplate();
        this.baseUrl = baseUrl;
        this.internalToken = internalToken;
    }

    public Map<String, Object> createOrGetSession(String classId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-internal-token", internalToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        return restTemplate.postForObject(
                baseUrl + "/internal/classrooms/" + classId + "/session",
                entity,
                Map.class);
    }
}
