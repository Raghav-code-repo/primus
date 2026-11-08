
package com.olympiad.identity.controller;

import java.util.List;

public record CurrentAuthoritiesResponse(
        String subject,
        List<String> authorities) {
}
