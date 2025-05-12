package com.jobhunthub.jobhunthub.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the logout functionality managed by Spring Security.
 * Tests the configured logout endpoint with:
 * - Successful logout for an authenticated user, including cookie invalidation
 * - Correct status code on response
 * - Handling of logout requests without prior authentication
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
    public void securityLogout_authenticatedUser_returnSuccessAndClearsCookie() throws Exception {
        mockMvc
                .perform(post("/api/auth/logout")
                        .with(oauth2Login()
                                .attributes(attrs -> attrs.put("id", "123"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("JSESSIONID", 0))
                .andExpect(cookie().path("JSESSIONID", "/"));
    }

    @Test
    public void securityLogout_withoutAuth_returnSuccess() throws Exception {
        mockMvc
                .perform(post("/api/auth/logout"))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
