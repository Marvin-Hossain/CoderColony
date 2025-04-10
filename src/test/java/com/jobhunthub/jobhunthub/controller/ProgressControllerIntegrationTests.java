package com.jobhunthub.jobhunthub.controller;

import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.JobService;
import com.jobhunthub.jobhunthub.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
 * Integration tests for ProgressController.
 * Tests endpoints for tracking user progress:
 * - Weekly progress stats
 * - All-time stats
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@ActiveProfiles("test")
@Transactional
public class ProgressControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    @BeforeEach
    public void setUp() {
        // Create and save the test user
        User testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        // Create and save a test job
        Job testJob = new Job();
        testJob.setTitle("Software Engineer");
        testJob.setCompany("Tech Company");
        testJob.setLocation("Remote");
        testJob.setStatus(Job.Status.APPLIED);
        testJob.setCreatedAt(LocalDate.now());
        testJob.setUser(testUser);
        jobService.createJob(testJob, testUser);
    }

    // Weekly Progress

    @Test
    public void ProgressController_getWeeklyProgress_returnStats() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/progress/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    // All-time Stats

    @Test
    public void ProgressController_getAllTimeStats_returnStats() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/progress/jobs/all-time")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    // Error Handling

    @Test
    public void ProgressController_getWeeklyProgress_withInvalidCategory_returnEmptyMap() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/progress/invalid-category")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isEmpty());
    }

    @Test
    public void ProgressController_getAllTimeStats_withInvalidCategory_returnEmptyMap() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/progress/invalid-category/all-time")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isEmpty());
    }
}
