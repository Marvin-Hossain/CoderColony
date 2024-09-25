package com.jobhunthub.jobhunthub.controller;

import com.jobhunthub.jobhunthub.model.User;
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

/**
 * Integration tests for OAuth2Controller.
 * Tests GitHub OAuth2 authentication flow and user info endpoints:
 * - Login success and user creation
 * - User info retrieval
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@ActiveProfiles("test")
@Transactional
public class OAuth2ControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @BeforeEach
    public void setUp() {
        // Create and save the test user
        User testUser = new User();
        testUser.setGithubId("123");
        testUser.setUsername("testuser");
        testUser.setAvatarUrl("https://github.com/testuser.png");
        userService.save(testUser);
    }

    @Test
    public void OAuth2Controller_getUser_returnUserInfo() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/auth/user")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.authenticated").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("testuser"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value(""))
                .andExpect(MockMvcResultMatchers.jsonPath("$.avatarUrl").value("https://github.com/testuser.png"));
    }

    @Test
    public void OAuth2Controller_getUser_withoutAuth_returnUnauthenticated() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.get("/api/auth/user"))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().is3xxRedirection())
                .andExpect(MockMvcResultMatchers.redirectedUrl("http://localhost/oauth2/authorization/github"));
    }
}
