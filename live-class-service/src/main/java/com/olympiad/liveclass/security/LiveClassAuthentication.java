
package com.olympiad.liveclass.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Set;

/**
 * Spring Security {@link Authentication} for STOMP/WebSocket chat and question
 * endpoints. {@link #getName()} returns the authenticated user id so that
 * {@code SimpMessagingTemplate.convertAndSendToUser(userId, ...)} resolves the
 * correct STOMP session, while {@link #getPrincipal()} exposes the
 * {@link LiveClassPrincipal} for service-layer authorization.
 */
public class LiveClassAuthentication implements Authentication {

    private final LiveClassPrincipal principal;
    private final Set<GrantedAuthority> authorities;
    private boolean authenticated = true;

    public LiveClassAuthentication(
            LiveClassPrincipal principal,
            Collection<? extends GrantedAuthority> authorities) {
        this.principal = principal;
        this.authorities = Set.copyOf(authorities);
    }

    @Override
    public String getName() {
        return principal.userId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getDetails() {
        return null;
    }

    @Override
    public LiveClassPrincipal getPrincipal() {
        return principal;
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean authenticated) throws IllegalArgumentException {
        this.authenticated = authenticated;
    }
}
