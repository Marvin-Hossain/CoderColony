package com.jobhunthub.jobhunthub.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.UserService;
import com.jobhunthub.jobhunthub.utils.AuthenticationUtils;

/**
 * Controller for OAuth2 related actions, primarily to fetch authenticated user details.
 */
@RestController
public class OAuth2Controller {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);

    private final UserService userService;

    public OAuth2Controller(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the details of the currently authenticated user.
     * If the user is authenticated, it returns their ID, username, email, and avatar URL.
     * Otherwise, it indicates that the user is not authenticated.
     *
     * @param authentication The {@link Authentication} object from Spring Security.
     * @return A map containing user details and authentication status.
     */
    @GetMapping("/api/auth/user")
    public Map<String, Object> getUser(Authentication authentication) {
        logger.info("Entering /api/auth/user endpoint check");
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("/api/auth/user: Authentication is null or not authenticated.");
            return Map.of("authenticated", false);
        }

        try {
            // AuthenticationUtils handles the logic of extracting user details
            // from the Authentication object and fetching from the database.
            User user = AuthenticationUtils.getCurrentUser(authentication, userService);

            logger.info("/api/auth/user: Successfully authenticated user: {}", user.getUsername());
            return Map.of(
                    "authenticated", true,
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
            );
        } catch (Exception e) {
            // This typically occurs if OAuth2 ID is missing or user is not found in the database.
            logger.warn("/api/auth/user: Failed to get current user: {}", e.getMessage());
            return Map.of("authenticated", false);
        }
    }
}