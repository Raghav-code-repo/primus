
package com.olympiad.identity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "security.jwt.secret=TestOnlySecretKeyForIdentityService1234567890"
})
class IdentityServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
