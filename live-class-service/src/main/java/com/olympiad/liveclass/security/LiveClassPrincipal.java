
package com.olympiad.liveclass.security;

import java.util.Set;

public record LiveClassPrincipal(
        String userId,
        String email,
        Set<String> roles
) {}
