package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.hamcrest.Matchers.is;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;
import com.jobhunthub.jobhunthub.dto.JobDTO;
import com.jobhunthub.jobhunthub.dto.UpdateJobRequestDTO;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.JobRepository;
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
    private JobRepository jobRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private JobDTO testJobDTO;

    @BeforeEach
    public void setUp() {
        testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userService.save(testUser);

        Job initialJobEntity = new Job();
        initialJobEntity.setTitle("Software Engineer");
        initialJobEntity.setCompany("Tech Company");
        initialJobEntity.setLocation("Remote");
        initialJobEntity.setStatus(Job.Status.APPLIED);
        initialJobEntity.setCreatedAt(LocalDate.now(ZoneId.systemDefault()));
        initialJobEntity.setUser(testUser);
        initialJobEntity = jobRepository.save(initialJobEntity);

        testJobDTO = JobDTO.fromEntity(initialJobEntity);
    }

    // Basic CRUD Operations

    @Test
    public void JobController_createJob_returnCreatedJobDTO() throws Exception {
        CreateJobRequestDTO createDto = new CreateJobRequestDTO(
                "Data Analyst",
                "Data Corp",
                "New York, NY"
        );

        mockMvc
                .perform(post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Data Analyst"))
                .andExpect(jsonPath("$.company").value("Data Corp"))
                .andExpect(jsonPath("$.location").value("New York, NY"))
                .andExpect(jsonPath("$.status").value(Job.Status.APPLIED.name()))
                .andExpect(jsonPath("$.userId").value(testUser.getId()));
    }

    @Test
    public void JobController_getJobById_returnJobDTO() throws Exception {
        mockMvc
                .perform(get("/api/jobs/" + testJobDTO.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testJobDTO.getId()))
                .andExpect(jsonPath("$.title").value(testJobDTO.getTitle()));
    }

    @Test
    public void JobController_getAllJobs_returnJobDTOList() throws Exception {
        mockMvc
                .perform(get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testJobDTO.getId()))
                .andExpect(jsonPath("$[0].title").value(testJobDTO.getTitle()));
    }

    @Test
    public void JobController_updateJob_canUpdateStatus_returnUpdatedJobDTO() throws Exception {
        UpdateJobRequestDTO updateDto = new UpdateJobRequestDTO(
                "Senior Software Engineer",
                "Tech Company Updated",
                "Phoenix, AZ",
                Job.Status.INTERVIEWED.name()
        );

        mockMvc
                .perform(put("/api/jobs/" + testJobDTO.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Software Engineer"))
                .andExpect(jsonPath("$.company").value("Tech Company Updated"))
                .andExpect(jsonPath("$.location").value("Phoenix, AZ"))
                .andExpect(jsonPath("$.status").value("INTERVIEWED"));
    }

    @Test
    public void JobController_updateJob_withoutStatusInPayload_preservesStatus() throws Exception {
        UpdateJobRequestDTO updateDto = new UpdateJobRequestDTO(
                "Principal Software Engineer",
                "Major Tech Corp",
                "Austin, TX",
                null
        );

        mockMvc
                .perform(put("/api/jobs/" + testJobDTO.getId())
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Principal Software Engineer"))
                .andExpect(jsonPath("$.status").value(Job.Status.APPLIED.name()));
    }

    @Test
    public void JobController_deleteJob_returnSuccess() throws Exception {
        mockMvc
                .perform(delete("/api/jobs/" + testJobDTO.getId())
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
                .andExpect(jsonPath("$.appliedCount").isNumber())
                .andExpect(jsonPath("$.todayCount").isNumber())
                .andExpect(jsonPath("$.interviewedCount").isNumber())
                .andExpect(jsonPath("$.rejectedCount").isNumber());
    }

    @Test
    public void JobController_getJobCount_returnCount() throws Exception {
        mockMvc
                .perform(get("/api/jobs/count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(1)));
    }

    @Test
    public void JobController_getTodayCount_returnTodayCount() throws Exception {
        mockMvc
                .perform(get("/api/jobs/today-count")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(1)));
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
        CreateJobRequestDTO invalidDto = new CreateJobRequestDTO("", "", "");

        mockMvc
                .perform(post("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void JobController_getAllJobs_verifySpecificFieldsInDTO() throws Exception {
        mockMvc
                .perform(get("/api/jobs")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testJobDTO.getId()))
                .andExpect(jsonPath("$[0].title").value(testJobDTO.getTitle()))
                .andExpect(jsonPath("$[0].company").value(testJobDTO.getCompany()))
                .andExpect(jsonPath("$[0].location").value(testJobDTO.getLocation()))
                .andExpect(jsonPath("$[0].status").value(testJobDTO.getStatus()))
                .andExpect(jsonPath("$[0].userId").value(testUser.getId()));
    }
}

