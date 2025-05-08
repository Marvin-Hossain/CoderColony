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
 * Integration tests for JobController.
 * Tests all endpoints with OAuth2 authentication and verifies:
 * - CRUD operations for jobs
 * - Statistics endpoints
 * - Error handling
 * - Response validation
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@ActiveProfiles("test")
@Transactional
public class JobControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    private User testUser;
    private Job testJob;

    @BeforeEach
    public void setUp() {
        // Create and save the test user
        testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        // Create and save a test job
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
                    "title": "Software Engineer",
                    "company": "Tech Company",
                    "location": "Remote",
                    "status": "APPLIED",
                    "createdAt": "2023-04-08",
                    "user": {
                        "id":""" + testUser.getId() + """
                    }
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jobJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    public void JobController_getJobById_returnJob() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(testJob.getId()));
    }

    @Test
    public void JobController_getAllJobs_returnJobsList() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(testJob.getId()));
    }

    @Test
    public void JobController_updateJob_returnUpdatedJob() throws Exception {
        String updatedJobJson = """
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Company Updated",
                    "location": "Remote",
                    "status": "APPLIED",
                    "createdAt": "2023-04-08"
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.put("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJobJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Senior Software Engineer"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.company").value("Tech Company Updated"));
    }

    @Test
    public void JobController_updateJobStatus_returnUpdatedStatus() throws Exception {
        String statusUpdateJson = """
                {
                    "status": "INTERVIEWED"
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.patch("/api/jobs/" + testJob.getId() + "/status")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusUpdateJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value("INTERVIEWED"));
    }

    @Test
    public void JobController_deleteJob_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.delete("/api/jobs/" + testJob.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Job deleted successfully!"));
    }

    // Statistics Endpoints

    @Test
    public void JobController_getDashboardStats_returnStats() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs/dashboard-stats")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.totalCount").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.appliedCount").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.todayCount").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.interviewedCount").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.rejectedCount").exists());
    }

    @Test
    public void JobController_getJobCount_returnCount() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs/count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.count").value(1));
    }

    @Test
    public void JobController_getTodayCount_returnTodayCount() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs/today-count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.count").value(1));
    }

    // Error Handling & Validation

    @Test
    public void JobController_getJobById_withInvalidId_returnNotFound() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs/999")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void JobController_createJob_withInvalidData_returnBadRequest() throws Exception {
        String invalidJobJson = """
                {
                    "title": "",  // Empty title
                    "company": "", // Empty company
                    "status": "INVALID_STATUS"  // Invalid status
                }
                """;

        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJobJson))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    // Response Structure Validation

    @Test
    public void JobController_getAllJobs_verifyFullResponse() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value(testJob.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].title").value("Software Engineer"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].company").value("Tech Company"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].location").value("Remote"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].status").value("APPLIED"));
    }
}

