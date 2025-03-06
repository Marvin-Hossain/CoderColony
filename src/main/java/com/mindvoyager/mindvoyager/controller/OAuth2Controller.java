package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/login/oauth2/code/{provider}")
    public RedirectView loginSuccess(@PathVariable String provider, OAuth2AuthenticationToken authenticationToken) {
        // Get user info from the authentication token
        OAuth2User oAuth2User = authenticationToken.getPrincipal();
        
        // Check for null before calling toString()
        Object idAttribute = oAuth2User.getAttribute("id");
        if (idAttribute == null) {
            logger.error("GitHub ID attribute is null");
            return new RedirectView("/login?error=missing_github_id");
        }
        String githubId = idAttribute.toString();
        
        String login = oAuth2User.getAttribute("login");
        String email = oAuth2User.getAttribute("email");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        
        logger.info("User logged in: {}", login);

        // Find or create user
        Optional<User> existingUser = userService.findByGithubId(githubId);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update user info if needed
            boolean needsUpdate = false;
            
            if (user.getUsername() == null || !user.getUsername().equals(login)) {
                user.setUsername(login);
                needsUpdate = true;
            }
            
            if (email != null && (user.getEmail() == null || !user.getEmail().equals(email))) {
                user.setEmail(email);
                needsUpdate = true;
            }
            
            if (avatarUrl != null && (user.getAvatarUrl() == null || !user.getAvatarUrl().equals(avatarUrl))) {
                user.setAvatarUrl(avatarUrl);
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                user = userService.save(user);
            }
        } else {
            // Create new user
            user = new User();
            user.setGithubId(githubId);
            user.setUsername(login);
            user.setEmail(email);
            user.setAvatarUrl(avatarUrl);
            user = userService.save(user);
        }

        // Redirect to the dashboard
        return new RedirectView("http://localhost:3000/dashboard");
    }
    
    @GetMapping("/api/auth/user")
    public Map<String, Object> getUser(Authentication authentication) {
        if (authentication == null || !(authentication instanceof OAuth2AuthenticationToken)) {
            return Map.of("authenticated", false);
        }
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        
        // Check for null before calling toString()
        Object idAttribute = oAuth2User.getAttribute("id");
        if (idAttribute == null) {
            return Map.of("authenticated", false);
        }
        String githubId = idAttribute.toString();
        
        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (!userOptional.isPresent()) {
            return Map.of("authenticated", false);
        }
        
        User user = userOptional.get();
        return Map.of(
            "authenticated", true,
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        );
    }
}