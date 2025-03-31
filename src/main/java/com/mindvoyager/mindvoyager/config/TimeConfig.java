package com.mindvoyager.mindvoyager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.ZoneId;

@Configuration
public class TimeConfig {
    @Value("${app.timezone}")
    private String timezone;

    @Bean
    public ZoneId zoneId() {
        return ZoneId.of(timezone);
    }
}
