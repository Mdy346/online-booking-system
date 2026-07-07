package com.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Online Reservation System - Backend Application
 * <p>
 * Core Spring Boot application entry point.
 * Auto-configures MyBatis-Plus, data sources, and web components.
 */
@SpringBootApplication
public class OnlineBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineBookingApplication.class, args);
    }
}
