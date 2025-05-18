package com.jobhunthub.jobhunthub.controller;

import java.util.List;
import java.util.Map;

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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

/**
 * Integration tests for OAuth2Controller.
 * Tests GitHub OAuth2 authentication flow and user info endpoints:
 * - Login success and user creation
 * - User info retrieval
 * - Handling of authenticated users not found in the database
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class OAuth2ControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;
    private UserPrincipal testPrincipal;

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
    }

    @Test
    public void OAuth2Controller_currentUser_returnUserInfo() throws Exception {
        mockMvc
                .perform(get("/api/auth/user")
                        .with(oauth2Login().oauth2User(testPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/testuser.png"));
    }

    @Test
    public void OAuth2Controller_currentUser_withoutAuth_returnUnauthenticated() throws Exception {
        mockMvc
                .perform(get("/api/auth/user"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false));
    }
}
