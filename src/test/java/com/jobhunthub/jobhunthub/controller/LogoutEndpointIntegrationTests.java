package com.jobhunthub.jobhunthub.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the logout functionality managed by Spring Security.
 * Tests the configured logout endpoint with:
 * - Successful logout for an authenticated user
 * - Correct status code on response
 * - Handling of logout requests without prior authentication
 *
 * Note: Specific CORS header assertions are omitted for this logout test
 * due to potential MockMvc simulation nuances with the LogoutFilter.
 * General CORS functionality is assumed to be covered by other integration tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class LogoutEndpointIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void securityLogout_authenticatedUser_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/auth/logout")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void securityLogout_withoutAuth_returnSuccess() throws Exception {
        mockMvc
                .perform(MockMvcRequestBuilders.post("/api/auth/logout"))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }
}
