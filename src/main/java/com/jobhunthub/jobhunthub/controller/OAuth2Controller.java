package com.jobhunthub.jobhunthub.controller;

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;
import java.util.Optional;

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

        if (authentication == null) {
            logger.warn("CHECK /api/auth/user: Received NULL authentication object!");
            return Map.of("authenticated", false);
        }

        // Log details about the Authentication object received
        logger.info("CHECK /api/auth/user: Received authentication object of type: {}", authentication.getClass().getName());
        logger.info("CHECK /api/auth/user: Is authenticated? {}", authentication.isAuthenticated());
        logger.info("CHECK /api/auth/user: Principal details: {}", authentication.getPrincipal());

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            logger.warn("CHECK /api/auth/user: Authentication object is NOT an OAuth2AuthenticationToken. Actual Type: {}", authentication.getClass().getName());
            return Map.of("authenticated", false);
        }

        // If we reach here, authentication is an OAuth2AuthenticationToken
        logger.info("CHECK /api/auth/user: Authentication object is a valid OAuth2AuthenticationToken.");
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        Object idAttribute = oAuth2User.getAttribute("id");
        if (idAttribute == null) {
            logger.warn("CHECK /api/auth/user: OAuth2User is missing 'id' attribute.");
            return Map.of("authenticated", false);
        }
        String githubId = idAttribute.toString();

        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (userOptional.isEmpty()) {
            logger.warn("CHECK /api/auth/user: User not found in DB for githubId: {}", githubId);
            return Map.of("authenticated", false);
        }

        User user = userOptional.get();
        logger.info("CHECK /api/auth/user: Successfully authenticated user: {}", user.getUsername());
        return Map.of(
                "authenticated", true,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        );
    }
}