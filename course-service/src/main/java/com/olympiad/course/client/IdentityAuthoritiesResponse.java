
package com.olympiad.course.client;

import java.util.List;

public record IdentityAuthoritiesResponse(
        String subject,
        List<String> authorities
) {}
