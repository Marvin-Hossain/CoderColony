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

@Service
public class OpenAIService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);

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
            System.out.println("OpenAI Service - Input received: " + userInput);  // Debug log
            
            Map<String, Object> requestBody = Map.of(
                "model", "gpt-4",
                "messages", List.of(
                    Map.of("role", "system", "content", 
                        "You are an experienced technical interview coach specializing in behavioral questions. " +
                        "Evaluate responses using the STAR method (Situation, Task, Action, Result). " +
                        "Be constructive but firm in your feedback. " +
                        "For each response, analyze:\n" +
                        "1. Structure and completeness\n" +
                        "2. Specific examples and details\n" +
                        "3. Professional impact and results\n" +
                        "4. Communication clarity\n\n" +
                        "Provide feedback in this JSON format:\n" +
                        "{\n" +
                        "  \"rating\": <number 1-10>,\n" +
                        "  \"feedback\": \"<Start with strengths, then areas for improvement, and end with actionable tips.>\"\n" +
                        "}"
                    ),
                    Map.of("role", "user", "content", userInput)
                ),
                "max_tokens", 1000,
                "temperature", 0.7  // Adjust between 0-1: lower for more consistent, higher for more creative
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            System.out.println("OpenAI Service - Sending request to OpenAI");  // Debug log
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );
            System.out.println("OpenAI Service - Received response from OpenAI");  // Debug log

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                Map<String, Object> choice = ((List<Map<String, Object>>) responseBody.get("choices")).get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                String content = (String) message.get("content");
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
            }

            System.out.println("OpenAI Service - No valid response found in choices");  // Debug log
            return "{\"rating\": 5, \"feedback\": \"Sorry, I couldn't process your request.\"}";
        } catch (Exception e) {
            System.err.println("OpenAI Service - Error: " + e.getMessage());  // Debug log
            e.printStackTrace();
            return "{\"rating\": 5, \"feedback\": \"An error occurred while communicating with OpenAI.\"}";
        }
    }
}
