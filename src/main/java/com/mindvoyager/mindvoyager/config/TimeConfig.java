package com.mindvoyager.mindvoyager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.ZoneId;

@Configuration
public class TimeConfig {
    // Timezone from application.properties (e.g., "America/Chicago")
    @Value("${app.timezone}")
    private String timezone;

    // Creates a ZoneId bean used for consistent timezone handling
    @Bean
    public ZoneId zoneId() {
        return ZoneId.of(timezone);
    }
}
