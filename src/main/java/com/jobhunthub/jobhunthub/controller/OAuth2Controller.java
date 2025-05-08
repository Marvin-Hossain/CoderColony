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


@RestController
public class OAuth2Controller {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);

    private final UserService userService;

    public OAuth2Controller(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/auth/user")
    public Map<String, Object> getUser(Authentication authentication) {
        logger.info("Entering /api/auth/user endpoint check");
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("/api/auth/user: Authentication is null or not authenticated.");
            return Map.of("authenticated", false);
        }

        try {
            // Delegate the core logic to AuthenticationUtils
            User user = AuthenticationUtils.getCurrentUser(authentication, userService);

            // If getCurrentUser succeeds, the user is valid and found
            logger.info("/api/auth/user: Successfully authenticated user: {}", user.getUsername());
            return Map.of(
                    "authenticated", true,
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
            );
        } catch (Exception e) { // Catch exceptions from getCurrentUser
            // Exceptions from AuthenticationUtils likely mean authentication failure, missing ID, or user not found in DB
            logger.warn("/api/auth/user: Failed to get current user: {}", e.getMessage());
            // Optionally log the stack trace at DEBUG level if needed: logger.debug("Stack trace:", e);
            return Map.of("authenticated", false);
        }
    }
}