package com.jobhunthub.jobhunthub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

public class OpenAIServiceTests {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OpenAIService openAIService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        // Set the private fields using ReflectionTestUtils
        ReflectionTestUtils.setField(openAIService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(openAIService, "apiUrl", "https://api.openai.com/v1/chat/completions");
    }

    @Test
    public void OpenAIService_getResponse_returnsValidResponse() throws Exception {
        // Arrange
        String userInput = "What is 2+2?";
        String aiPrompt = "You are a math tutor";
        String mockApiResponse = """
                {
                    "choices": [{
                        "message": {
                            "content": "{\\"rating\\": 8, \\"feedback\\": \\"Great answer!\\"}"
                        }
                    }]
                }
                """;

        String expectedContent = "{\"rating\": 8, \"feedback\": \"Great answer!\"}";

        // Mock the first JSON parsing (for the API response)
        var mockJsonNode = new ObjectMapper().readTree(mockApiResponse);
        when(objectMapper.readTree(mockApiResponse)).thenReturn(mockJsonNode);

        // Mock the second JSON parsing (for the content)
        when(objectMapper.readTree(expectedContent)).thenReturn(new ObjectMapper().readTree(expectedContent));

        when(restTemplate.postForEntity(
                eq("https://api.openai.com/v1/chat/completions"),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(ResponseEntity.ok(mockApiResponse));

        // Act
        String result = openAIService.getResponse(userInput, aiPrompt);

        // Assert
        assertThat(result).contains("\"rating\": 8");
        assertThat(result).contains("\"feedback\": \"Great answer!\"");
    }

    @Test
    public void OpenAIService_getResponse_handlesError() {
        // Arrange
        String userInput = "What is 2+2?";
        String aiPrompt = "You are a math tutor";

        when(restTemplate.postForEntity(
                any(String.class),
                any(HttpEntity.class),
                eq(String.class)
        )).thenThrow(new RuntimeException("API Error"));

        // Act
        String result = openAIService.getResponse(userInput, aiPrompt);

        // Assert
        assertThat(result).contains("\"rating\": 5");
        assertThat(result).contains("I apologize, but I'm having trouble processing your request right now.");
    }

    @Test
    public void OpenAIService_getResponse_handlesNonJsonResponse() throws Exception {
        // Arrange
        String userInput = "What is 2+2?";
        String aiPrompt = "You are a math tutor";
        String mockApiResponse = """
                {
                    "choices": [{
                        "message": {
                            "content": "This is not JSON"
                        }
                    }]
                }
                """;

        when(restTemplate.postForEntity(
                any(String.class),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(ResponseEntity.ok(mockApiResponse));

        when(objectMapper.readTree(mockApiResponse))
                .thenReturn(new ObjectMapper().readTree(mockApiResponse));

        when(objectMapper.readTree("This is not JSON"))
                .thenThrow(new RuntimeException("Invalid JSON"));

        when(objectMapper.writeValueAsString("This is not JSON"))
                .thenReturn("\"This is not JSON\"");

        // Act
        String result = openAIService.getResponse(userInput, aiPrompt);

        // Assert
        assertThat(result).contains("\"rating\": 7");
        assertThat(result).contains("This is not JSON");
    }

    @Test
    public void OpenAIService_getResponse_usesCorrectHeaders() {
        // Arrange
        String userInput = "Test input";
        String aiPrompt = "Test prompt";
        String mockApiResponse = """
                {
                    "choices": [{
                        "message": {
                            "content": {
                                "rating": 8,
                                "feedback": "Test feedback"
                            }
                        }
                    }]
                }
                """;

        // Use ArgumentCaptor to capture the HttpEntity passed to restTemplate
        when(restTemplate.postForEntity(
                any(String.class),
                any(HttpEntity.class),
                eq(String.class)
        )).thenAnswer(invocation -> {
            HttpEntity<?> requestEntity = invocation.getArgument(1);
            HttpHeaders headers = requestEntity.getHeaders();

            // Verify headers
            assertThat(headers.getContentType().toString()).isEqualTo("application/json");
            assertThat(headers.getFirst(HttpHeaders.AUTHORIZATION))
                    .isEqualTo("Bearer test-api-key");

            return ResponseEntity.ok(mockApiResponse);
        });

        // Act
        openAIService.getResponse(userInput, aiPrompt);
    }
}