// RestTemplateConfig.java
package com.jobhunthub.jobhunthub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    // Creates a RestTemplate bean for making HTTP requests
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
