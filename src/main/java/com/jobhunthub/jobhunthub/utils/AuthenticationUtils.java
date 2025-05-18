package com.jobhunthub.jobhunthub.utils;

import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.UserService;

public final class AuthenticationUtils {
    // Utility class - no instances needed
    private AuthenticationUtils() {
    }

    // Gets the current User from OAuth2 authentication
    // Throws RuntimeException if:
    // - Not authenticated via OAuth2
    // - GitHub ID not found
    // - User not in our database
    public static User getCurrentUser(Authentication authentication, UserService userService) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new RuntimeException("User not authenticated");
        }

        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String githubId = Objects.requireNonNull(oAuth2User.getAttribute("id")).toString();

        return userService.findByGithubId(githubId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
