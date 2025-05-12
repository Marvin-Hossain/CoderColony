package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.JobService;
import com.jobhunthub.jobhunthub.service.UserService;

/**
 * Integration tests for JobController.
 * Tests all endpoints with OAuth2 authentication and verifies:
 * - CRUD operations for jobs
 * - Statistics endpoints
 * - Error handling
 * - Response validation
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class JobControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    private Job testJob;

    @BeforeEach
    public void setUp() {
        User testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        testJob = new Job();
        testJob.setTitle("Software Engineer");
        testJob.setCompany("Tech Company");
        testJob.setLocation("Remote");
        testJob.setStatus(Job.Status.APPLIED);
        testJob.setCreatedAt(LocalDate.now());
        testJob.setUser(testUser);
        testJob = jobService.createJob(testJob, testUser);
    }

    // Basic CRUD Operations

    @Test
    public void JobController_createJob_returnCreatedJob() throws Exception {
        String jobJson = """
                {
                    "title": "Data Analyst",
                    "company": "Data Corp",
                    "location": "Remote",
                    "status": "APPLIED"
                }
                """;

        mockMvc
                .perform(post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jobJson))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Data Analyst"));
    }

    @Test
    public void JobController_getJobById_returnJob() throws Exception {
        mockMvc
                .perform(get("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testJob.getId()));
    }

    @Test
    public void JobController_getAllJobs_returnJobsList() throws Exception {
        mockMvc
                .perform(get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testJob.getId()));
    }

    @Test
    public void JobController_updateJob_returnUpdatedJob() throws Exception {
        String updatedJobJson = """
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Company Updated",
                    "location": "Phoenix, AZ",
                    "status": "INTERVIEWED"
                }
                """;

        mockMvc
                .perform(put("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJobJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Software Engineer"))
                .andExpect(jsonPath("$.company").value("Tech Company Updated"))
                .andExpect(jsonPath("$.location").value("Phoenix, AZ"))
                .andExpect(jsonPath("$.status").value("INTERVIEWED"));
    }

    @Test
    public void JobController_updateJobStatus_returnUpdatedStatus() throws Exception {
        String statusUpdateJson = """
                {
                    "status": "REJECTED"
                }
                """;

        mockMvc
                .perform(patch("/api/jobs/" + testJob.getId() + "/status")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusUpdateJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    public void JobController_deleteJob_returnSuccess() throws Exception {
        mockMvc
                .perform(delete("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Job deleted successfully!"));
    }

    // Statistics Endpoints

    @Test
    public void JobController_getDashboardStats_returnStats() throws Exception {
        mockMvc
                .perform(get("/api/jobs/dashboard-stats")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").exists())
                .andExpect(jsonPath("$.appliedCount").exists())
                .andExpect(jsonPath("$.todayCount").exists())
                .andExpect(jsonPath("$.interviewedCount").exists())
                .andExpect(jsonPath("$.rejectedCount").exists());
    }

    @Test
    public void JobController_getJobCount_returnCount() throws Exception {
        mockMvc
                .perform(get("/api/jobs/count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    public void JobController_getTodayCount_returnTodayCount() throws Exception {
        mockMvc
                .perform(get("/api/jobs/today-count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    // Error Handling & Validation

    @Test
    public void JobController_getJobById_withInvalidId_returnNotFound() throws Exception {
        mockMvc
                .perform(get("/api/jobs/99999")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    public void JobController_createJob_withInvalidData_returnBadRequest() throws Exception {
        String invalidJobJson = """
                {
                    "title": "",
                    "company": ""
                }
                """;

        mockMvc
                .perform(post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJobJson))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    // Response Structure Validation (Optional, example included)

    @Test
    public void JobController_getAllJobs_verifySpecificFields() throws Exception {
        mockMvc
                .perform(get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testJob.getId()))
                .andExpect(jsonPath("$[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$[0].company").value("Tech Company"))
                .andExpect(jsonPath("$[0].location").value("Remote"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"));
    }
}

