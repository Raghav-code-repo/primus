package com.olympiad.liveclass.security;

import java.util.List;

public record IdentityPermissionsResponse(
        String subject,
        List<String> authorities
) {
}