package com.mindvoyager.mindvoyager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class OpenAIService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String getResponse(String userInput, String aiPrompt) {
        try {
            logger.info("Received user input: {}", userInput); // Log user input
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                "model", "gpt-4",
                "messages", List.of(
                    Map.of("role", "system", "content", aiPrompt),
                    Map.of("role", "user", "content", userInput)
                ),
                "temperature", 0.7,
                "max_tokens", 1000
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            System.out.println("OpenAI Service - Sending request to OpenAI");  // Debug log
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
            System.out.println("OpenAI Service - Received response from OpenAI");  // Debug log

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            String content = jsonResponse.path("choices").get(0).path("message").path("content").asText();
            System.out.println("OpenAI Service - Raw GPT response: " + content);  // Debug log
            
            // Verify JSON format
            try {
                new ObjectMapper().readTree(content);
                return content;
            } catch (Exception e) {
                // If response isn't valid JSON, format it
                return String.format(
                    "{\"rating\": 7, \"feedback\": %s}", 
                    new ObjectMapper().writeValueAsString(content)
                );
            }
        } catch (Exception e) {
            logger.error("Error processing request: {}", e.getMessage()); // Log error message
            return "{\"rating\": 5, \"feedback\": \"I apologize, but I'm having trouble processing your request right now.\"}";
        }
    }
}
