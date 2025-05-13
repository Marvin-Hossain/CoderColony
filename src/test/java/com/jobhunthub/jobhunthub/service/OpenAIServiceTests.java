package com.jobhunthub.jobhunthub.service;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class OpenAIServiceTests {

    @Mock
    private RestClient restClient;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    @InjectMocks
    private OpenAIService openAIService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(openAIService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(openAIService, "apiUrl", "https://api.openai.com/v1/chat/completions");

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(String.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any(MediaType.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.headers(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(anyMap())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
    }

    @Test
    public void OpenAIService_getResponse_returnsValidResponse() throws Exception {
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

        var mockJsonNode = new ObjectMapper().readTree(mockApiResponse);
        when(objectMapper.readTree(mockApiResponse)).thenReturn(mockJsonNode);
        when(objectMapper.readTree(expectedContent)).thenReturn(new ObjectMapper().readTree(expectedContent));

        when(responseSpec.toEntity(String.class)).thenReturn(ResponseEntity.ok(mockApiResponse));

        String result = openAIService.getResponse(userInput, aiPrompt);

        assertThat(result).contains("\"rating\": 8");
        assertThat(result).contains("\"feedback\": \"Great answer!\"");
    }

    @Test
    public void OpenAIService_getResponse_handlesError() {
        String userInput = "What is 2+2?";
        String aiPrompt = "You are a math tutor";

        when(requestBodySpec.retrieve()).thenThrow(new RuntimeException("API Error"));

        String result = openAIService.getResponse(userInput, aiPrompt);

        assertThat(result).contains("\"rating\": 5");
        assertThat(result).contains("I apologize, but I'm having trouble processing your request right now.");
    }

    @Test
    public void OpenAIService_getResponse_handlesNonJsonResponse() throws Exception {
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

        when(responseSpec.toEntity(String.class)).thenReturn(ResponseEntity.ok(mockApiResponse));

        when(objectMapper.readTree(mockApiResponse))
                .thenReturn(new ObjectMapper().readTree(mockApiResponse));

        when(objectMapper.readTree("This is not JSON"))
                .thenThrow(new RuntimeException("Invalid JSON"));

        when(objectMapper.writeValueAsString("This is not JSON"))
                .thenReturn("\"This is not JSON\"");

        String result = openAIService.getResponse(userInput, aiPrompt);

        assertThat(result).contains("\"rating\": 7");
        assertThat(result).contains("This is not JSON");
    }

    @Test
    public void OpenAIService_getResponse_usesCorrectHeaders() throws Exception {
        String userInput = "Test input";
        String aiPrompt = "Test prompt";
        String mockResponseBody = "{\"choices\":[{\"message\":{\"content\":\"test content\"}}]}";

        when(responseSpec.toEntity(String.class))
                .thenReturn(ResponseEntity.ok(mockResponseBody));

        JsonNode actualJsonNode = new ObjectMapper().readTree(mockResponseBody);
        when(objectMapper.readTree(mockResponseBody)).thenReturn(actualJsonNode);

        openAIService.getResponse(userInput, aiPrompt);

        verify(restClient).post();
        verify(requestBodyUriSpec).uri(any(String.class));
        verify(requestBodySpec).contentType(eq(MediaType.APPLICATION_JSON));
        verify(requestBodySpec).headers(any());
        verify(requestBodySpec).body(anyMap());
        verify(requestBodySpec).retrieve();
        verify(responseSpec).toEntity(String.class);
    }
}