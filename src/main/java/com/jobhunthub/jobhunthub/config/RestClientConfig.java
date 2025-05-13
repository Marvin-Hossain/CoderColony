package com.jobhunthub.jobhunthub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuration class for setting up HTTP client beans.
 */
@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        // You can customize the builder here if needed, e.g., with base URLs, default headers, etc.
        // Example: return builder.baseUrl("https://api.example.com").build();
        return builder.build(); // Builds a default RestClient
    }
}

