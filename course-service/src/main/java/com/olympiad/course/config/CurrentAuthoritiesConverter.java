
package com.olympiad.course.config;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.olympiad.course.client.IdentityAuthoritiesResponse;

@Component
public class CurrentAuthoritiesConverter
        implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final RestClient restClient;

    public CurrentAuthoritiesConverter(
            @Value("${identity.service.base-url:http://localhost:8080}")
            String identityUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(identityUrl)
                .build();
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        try {
            IdentityAuthoritiesResponse response = restClient.get()
                    .uri("/api/auth/permissions")
                    .headers(headers ->
                            headers.setBearerAuth(jwt.getTokenValue()))
                    .retrieve()
                    .body(IdentityAuthoritiesResponse.class);

            if (response == null || response.authorities() == null) {
                throw new JwtException(
                        "Identity Service returned no authorities");
            }

            if (jwt.getSubject() == null
                    || !jwt.getSubject().equals(response.subject())) {
                throw new JwtException(
                        "Identity Service subject does not match JWT");
            }

            return response.authorities().stream()
                    .map(SimpleGrantedAuthority::new)
                    .map(authority -> (GrantedAuthority) authority)
                    .toList();

        } catch (RestClientException ex) {
            throw new JwtException(
                    "Unable to retrieve current authorities from Identity Service",
                    ex);
        }
    }
}
