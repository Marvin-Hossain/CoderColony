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
    // Default GPT-4 settings
    private static final String DEFAULT_MODEL = "gpt-4";
    private static final double DEFAULT_TEMPERATURE = 0.7;
    private static final int DEFAULT_MAX_TOKENS = 1000;

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

    // Main method to get AI response
    public String getResponse(String userInput, String aiPrompt) {
        try {
            HttpHeaders headers = createHeaders();
            Map<String, Object> requestBody = createRequestBody(aiPrompt, userInput);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            return processResponse(response.getBody());
        } catch (Exception e) {
            logger.error("Error in OpenAI request: {}", e.getMessage());
            return createErrorResponse();
        }
    }

    // Helper methods for OpenAI API interaction
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        return headers;
    }

    private Map<String, Object> createRequestBody(String aiPrompt, String userInput) {
        return Map.of(
                "model", DEFAULT_MODEL,
                "messages", List.of(
                        Map.of("role", "system", "content", aiPrompt),
                        Map.of("role", "user", "content", userInput)
                ),
                "temperature", DEFAULT_TEMPERATURE,
                "max_tokens", DEFAULT_MAX_TOKENS
        );
    }

    private String processResponse(String responseBody) throws Exception {
        JsonNode jsonResponse = objectMapper.readTree(responseBody);
        String content = jsonResponse.path("choices").get(0).path("message").path("content").asText();

        try {
            objectMapper.readTree(content);
            return content;
        } catch (Exception e) {
            return formatInvalidJsonResponse(content);
        }
    }

    private String formatInvalidJsonResponse(String content) throws Exception {
        return String.format(
                "{\"rating\": 7, \"feedback\": %s}",
                objectMapper.writeValueAsString(content)
        );
    }

    // Fallback response if something goes wrong
    private String createErrorResponse() {
        return "{\"rating\": 5, \"feedback\": \"I apologize, but I'm having trouble processing your request right now.\"}";
    }
}
