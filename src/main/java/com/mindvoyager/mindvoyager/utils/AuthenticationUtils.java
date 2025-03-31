package com.mindvoyager.mindvoyager.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.service.UserService;

import java.util.Objects;

public final class AuthenticationUtils {
    private AuthenticationUtils() {} // Prevent instantiation

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
