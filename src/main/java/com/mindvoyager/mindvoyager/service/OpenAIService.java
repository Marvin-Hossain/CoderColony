package com.mindvoyager.mindvoyager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public OpenAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getResponse(String userInput) {
        try {
            // Construct request body for chat-based models
            Map<String, Object> requestBody = Map.of(
                    "model", "gpt-4o-mini", // or "gpt-4"
                    "messages", List.of(
                            Map.of("role", "system", "content", "You will be given a personality once project idea is finalized. You will only speak within 50 tokens."),
                            Map.of("role", "user", "content", userInput)
                    ),
                    "max_tokens", 50
            );

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create the HTTP entity
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make the POST request
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            // Extract and return the assistant's response
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                Map<String, Object> choice = ((List<Map<String, Object>>) responseBody.get("choices")).get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                return (String) message.get("content");
            }

            return "Sorry, I couldn't process your request.";
        } catch (Exception e) {
            // Log the error
            System.err.println("Error communicating with OpenAI: " + e.getMessage());
            e.printStackTrace();
            return "An error occurred while communicating with OpenAI.";
        }
    }
}
