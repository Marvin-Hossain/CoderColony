package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.jobhunthub.jobhunthub.model.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;
import com.jobhunthub.jobhunthub.service.QuestionService;

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
@ActiveProfiles("test")
@Transactional
public class QuestionControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private UserRepository userRepository;

    private Question testQuestion;
    private UserPrincipal testPrincipal;

    @BeforeEach
    public void setUp() {
        User testUser = new User();
        Profile p = new Profile();
        p.setUser(testUser);
        testUser.setGithubId("12345");
        p.setUsername("testuser");
        p.setPrimaryEmail("test@test.com");
        p.setGithubEmail("test@test.com");
        p.setAvatarUrl("https://github.com/testuser.png");
        testUser = userRepository.save(testUser);

        // build a stubbed OAuth2User that matches what your UserService would see
        var delegate = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),    // or whatever roles you use
                Map.of("id", testUser.getGithubId(),                 // principal.getName() -> providerId
                        "name", p.getUsername(),                 // unused by loadByProviderId()
                        "email", p.getPrimaryEmail(),
                        "avatar_url", p.getAvatarUrl()
                ),
                "id"  // the key in the map to use as getName()
        );

        // wrap it in your UserPrincipal
        this.testPrincipal = new UserPrincipal(delegate, testUser);

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
                .perform(post("/api/questions/behavioral/add")
                        .with(oauth2Login().oauth2User(testPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionJson))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.question").value("Describe a project you're proud of"));
    }

    @Test
    public void QuestionController_getAllQuestions_returnQuestionsList() throws Exception {
        mockMvc
                .perform(get("/api/questions/behavioral/all")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testQuestion.getId()));
    }

    @Test
    public void QuestionController_getRandomQuestion_returnQuestion() throws Exception {
        mockMvc
                .perform(get("/api/questions/behavioral/question")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").exists());
    }

    @Test
    public void QuestionController_deleteQuestion_returnNoContent() throws Exception {
        mockMvc
                .perform(delete("/api/questions/behavioral/" + testQuestion.getId())
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    // Question Evaluation

    @Test
    public void QuestionController_evaluateResponse_returnEvaluatedQuestion() throws Exception {
        String questionText = testQuestion.getQuestion();
        String evaluateJson = """
                {
                    "question": "%s",
                    "response": "In my previous role, I faced a challenging deadline..."
                }
                """.formatted(questionText);

        mockMvc
                .perform(post("/api/questions/behavioral/evaluate")
                        .with(oauth2Login().oauth2User(testPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(evaluateJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responseText").exists());
    }

    // Statistics Endpoints

    @Test
    public void QuestionController_getTodayCount_returnCount() throws Exception {
        mockMvc
                .perform(get("/api/questions/behavioral/count")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").exists());
    }

    // Reset Functionality

    @Test
    public void QuestionController_resetQuestions_returnSuccess() throws Exception {
        mockMvc
                .perform(post("/api/questions/behavioral/reset")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void QuestionController_resetQuestionDate_returnSuccess() throws Exception {
        String questionText = testQuestion.getQuestion();
        String resetJson = """
                {
                    "question": "%s"
                }
                """.formatted(questionText);

        mockMvc
                .perform(post("/api/questions/behavioral/reset-date")
                        .with(oauth2Login().oauth2User(testPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resetJson))
                .andDo(print())
                .andExpect(status().isOk());
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
                .perform(post("/api/questions/behavioral/evaluate")
                        .with(oauth2Login().oauth2User(testPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
