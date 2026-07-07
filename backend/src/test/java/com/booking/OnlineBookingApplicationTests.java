package com.booking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test to verify Spring context loads successfully.
 * Uses H2 in-memory database for isolated test execution.
 */
@SpringBootTest
@ActiveProfiles("test")
class OnlineBookingApplicationTests {

    @Test
    void contextLoads() {
        // Ensures all beans, data sources, and MyBatis configuration
        // are wired correctly at startup.
    }
}
