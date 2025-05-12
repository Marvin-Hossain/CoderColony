package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.JobService;
import com.jobhunthub.jobhunthub.service.UserService;

/**
 * Integration tests for ProgressController.
 * Tests endpoints for tracking user progress:
 * - Weekly progress stats
 * - All-time stats
 */
@SpringBootTest
@AutoConfigureMockMvc
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
        User testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        Job testJob = new Job();
        testJob.setTitle("Software Engineer");
        testJob.setCompany("Tech Company");
        testJob.setLocation("Remote");
        testJob.setStatus(Job.Status.APPLIED);
        testJob.setCreatedAt(LocalDate.now());
        testJob.setUser(testUser);
        jobService.createJob(testJob, testUser);

        Job oldJob = new Job();
        oldJob.setTitle("Past Role");
        oldJob.setCompany("Previous LLC");
        oldJob.setLocation("Dallas, TX");
        oldJob.setStatus(Job.Status.REJECTED);
        oldJob.setCreatedAt(LocalDate.now().minusMonths(1));
        oldJob.setUser(testUser);
        jobService.createJob(oldJob, testUser);
    }

    // Weekly Progress

    @Test
    public void ProgressController_getWeeklyProgress_returnStats() throws Exception {
        mockMvc
                .perform(get("/api/progress/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk());
    }

    // All-time Stats

    @Test
    public void ProgressController_getAllTimeStats_returnStats() throws Exception {
        mockMvc
                .perform(get("/api/progress/jobs/all-time")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk());
    }

    // Error Handling

    @Test
    public void ProgressController_getWeeklyProgress_withInvalidCategory_returnEmptyMap() throws Exception {
        mockMvc
                .perform(get("/api/progress/invalid-category")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    public void ProgressController_getAllTimeStats_withInvalidCategory_returnEmptyMap() throws Exception {
        mockMvc
                .perform(get("/api/progress/invalid-category/all-time")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
