package com.jobhunthub.jobhunthub.controller;

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
 * Integration tests for LogoutController.
 * Tests the logout endpoint with:
 * - Successful logout
 * - CORS headers
 * - Unauthenticated access
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@ActiveProfiles("test")
@Transactional
public class LogoutControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void LogoutController_logout_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/auth/logout")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(MockMvcResultMatchers.header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    public void LogoutController_logoutWithoutAuth_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/auth/logout"))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(MockMvcResultMatchers.header().string("Access-Control-Allow-Credentials", "true"));
    }
}
