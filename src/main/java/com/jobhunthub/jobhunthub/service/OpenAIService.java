package com.jobhunthub.jobhunthub.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OpenAIService(RestClient restClient, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    public String getResponse(String userInput, String aiPrompt) {
        try {
            Map<String, Object> requestBody = createRequestBody(aiPrompt, userInput);

            ResponseEntity<String> response = restClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(h -> h.setBearerAuth(apiKey))
                    .body(requestBody)
                    .retrieve()
                    .toEntity(String.class);

            return processResponse(response.getBody());
        } catch (Exception e) {
            logger.error("Error in OpenAI request using RestClient: {}", e.getMessage(), e);
            return createErrorResponse();
        }
    }

    // Helper methods for OpenAI API interaction
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
        if (responseBody == null || responseBody.isEmpty()) {
            logger.warn("Received null or empty response body from OpenAI.");
            return createErrorResponse();
        }
        JsonNode jsonResponse = objectMapper.readTree(responseBody);
        String content = jsonResponse.path("choices").get(0).path("message").path("content").asText();

        if (content == null || content.isEmpty()) {
             logger.warn("Extracted null or empty content from OpenAI response choices.");
             return createErrorResponse();
        }

        try {
            objectMapper.readTree(content);
            return content;
        } catch (Exception e) {
            logger.warn("OpenAI response content was not valid JSON. Formatting as feedback. Content: {}", content);
            return formatInvalidJsonResponse(content);
        }
    }

    private String formatInvalidJsonResponse(String content) throws Exception {
        return String.format(
                "{\"rating\": 7, \"feedback\": %s}",
                objectMapper.writeValueAsString(content)
        );
    }

    private String createErrorResponse() {
        return "{\"rating\": 5, \"feedback\": \"I apologize, but I'm having trouble processing your request right now.\"}";
    }
}
