package com.jobhunthub.jobhunthub.controller;

import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.QuestionService;
import com.jobhunthub.jobhunthub.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Integration tests for QuestionController.
 * Tests all endpoints with OAuth2 authentication and verifies:
 * - CRUD operations for questions
 * - Question evaluation
 * - Statistics endpoints
 * - Reset functionality
 * - Error handling
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@ActiveProfiles("test")
@Transactional
public class QuestionControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private QuestionService questionService;

    private Question testQuestion;

    @BeforeEach
    public void setUp() {
        // Create and save the test user
        User testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        // Create and save a test question
        testQuestion = new Question();
        testQuestion.setType(Question.QuestionType.BEHAVIORAL);
        testQuestion.setQuestion("Tell me about a time you handled a difficult situation.");
        testQuestion.setUpdatedAt(LocalDate.now());
        testQuestion.setUser(testUser);
        testQuestion = questionService.addQuestion(testQuestion, testUser, Question.QuestionType.BEHAVIORAL);
    }

    // Basic CRUD Operations

    @Test
    public void QuestionController_addQuestion_returnCreatedQuestion() throws Exception {
        String questionJson = """
                {
                    "type": "BEHAVIORAL",
                    "question": "Describe a project you're proud of",
                    "updatedAt": "%s"
                }
                """.formatted(LocalDate.now());

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/questions/behavioral/add")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.question").value("Describe a project you're proud of"));
    }

    @Test
    public void QuestionController_getAllQuestions_returnQuestionsList() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/questions/behavioral/all")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(testQuestion.getId()));
    }

    @Test
    public void QuestionController_getRandomQuestion_returnQuestion() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/questions/behavioral/question")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.question").exists());
    }

    @Test
    public void QuestionController_deleteQuestion_returnNoContent() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.delete("/api/questions/behavioral/" + testQuestion.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    // Question Evaluation

    @Test
    public void QuestionController_evaluateResponse_returnEvaluatedQuestion() throws Exception {
        String evaluateJson = """
                {
                    "question": "Tell me about a time you handled a difficult situation.",
                    "response": "In my previous role, I faced a challenging deadline..."
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/questions/behavioral/evaluate")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(evaluateJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.responseText").exists());
    }

    // Statistics Endpoints

    @Test
    public void QuestionController_getTodayCount_returnCount() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/questions/behavioral/count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.count").exists());
    }

    // Reset Functionality

    @Test
    public void QuestionController_resetQuestions_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/questions/behavioral/reset")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void QuestionController_resetQuestionDate_returnSuccess() throws Exception {
        String resetJson = """
                {
                    "question": "Tell me about a time you handled a difficult situation."
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/questions/behavioral/reset-date")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    // Error Handling & Validation

    @Test
    public void QuestionController_evaluateResponse_withInvalidData_returnBadRequest() throws Exception {
        String invalidJson = """
                {
                    "question": "",
                    "response": ""
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/questions/behavioral/evaluate")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }
}
