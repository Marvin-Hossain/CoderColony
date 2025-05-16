package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.JobRepository;
import com.jobhunthub.jobhunthub.repository.UserRepository;
import com.jobhunthub.jobhunthub.service.JobService;

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
    private UserRepository userRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private JobRepository jobRepository;

    private UserPrincipal testPrincipal;
    private final static int WEEK_DAYS = 7;

    @BeforeEach
    public void setUp() {
        User testUser = new User();
        testUser.setProvider("github");
        testUser.setProviderId("123");
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userRepository.save(testUser);

        // build a stubbed OAuth2User that matches what your UserService would see
        var delegate = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),    // or whatever roles you use
                Map.of("id", testUser.getProviderId(),                 // principal.getName() -> providerId
                        "name", testUser.getUsername(),                 // unused by loadByProviderId()
                        "email", testUser.getEmail(),
                        "avatar_url", testUser.getAvatarUrl()
                ),
                "id"  // the key in the map to use as getName()
        );

        // wrap it in your UserPrincipal
        this.testPrincipal = new UserPrincipal(delegate, testUser);

        CreateJobRequestDTO todayJobDto = new CreateJobRequestDTO(
                "Software Engineer Today",
                "Tech Company Today",
                "Remote"
        );
        jobService.createJob(todayJobDto, testUser);

        com.jobhunthub.jobhunthub.model.Job yesterdayJobEntity = new com.jobhunthub.jobhunthub.model.Job();
        yesterdayJobEntity.setTitle("Software Engineer Yesterday");
        yesterdayJobEntity.setCompany("Tech Company Yesterday");
        yesterdayJobEntity.setLocation("Office, ST");
        yesterdayJobEntity.setStatus(com.jobhunthub.jobhunthub.model.Job.Status.INTERVIEWED);
        yesterdayJobEntity.setCreatedAt(LocalDate.now(ZoneId.systemDefault()).minusDays(1));
        yesterdayJobEntity.setUser(testUser);
        jobRepository.save(yesterdayJobEntity);

        com.jobhunthub.jobhunthub.model.Job oldJobEntity = new com.jobhunthub.jobhunthub.model.Job();
        oldJobEntity.setTitle("Past Role");
        oldJobEntity.setCompany("Previous LLC");
        oldJobEntity.setLocation("Dallas, TX");
        oldJobEntity.setStatus(com.jobhunthub.jobhunthub.model.Job.Status.REJECTED);
        oldJobEntity.setCreatedAt(LocalDate.now(ZoneId.systemDefault()).minusMonths(1));
        oldJobEntity.setUser(testUser);
        jobRepository.save(oldJobEntity);
    }

    @Test
    public void ProgressController_getWeeklyProgress_returnsWeeklyJobStatsDTO() throws Exception {
        mockMvc
                .perform(get("/api/progress/jobs")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").isNumber())
                .andExpect(jsonPath("$.todayCount").isNumber())
                .andExpect(jsonPath("$.applied").isNumber())
                .andExpect(jsonPath("$.interviewed").isNumber())
                .andExpect(jsonPath("$.rejected").isNumber())
                .andExpect(jsonPath("$.chartData").isArray())
                .andExpect(jsonPath("$.chartData", hasSize(WEEK_DAYS)));
    }

    @Test
    public void ProgressController_getAllTimeStats_returnsAllTimeJobStatsDTO() throws Exception {
        mockMvc
                .perform(get("/api/progress/jobs/all-time")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", is(3)))
                .andExpect(jsonPath("$.average").exists())
                .andExpect(jsonPath("$.bestDay").isNumber())
                .andExpect(jsonPath("$.applied", is(1)))
                .andExpect(jsonPath("$.interviewed", is(1)))
                .andExpect(jsonPath("$.rejected", is(1)));
    }

    @Test
    public void ProgressController_getWeeklyProgress_withInvalidCategory_returnEmptyJson() throws Exception {
        mockMvc
                .perform(get("/api/progress/invalid-category")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json("{}"));
    }

    @Test
    public void ProgressController_getAllTimeStats_withInvalidCategory_returnEmptyJson() throws Exception {
        mockMvc
                .perform(get("/api/progress/invalid-category/all-time")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json("{}"));
    }
}
