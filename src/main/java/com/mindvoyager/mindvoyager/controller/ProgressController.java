package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.ProgressService;
import com.mindvoyager.mindvoyager.service.UserService;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class ProgressController {

    private final ProgressService progressService;
    private final UserService userService;

    public ProgressController(ProgressService progressService, UserService userService) {
        this.progressService = progressService;
        this.userService = userService;
    }

    private User getCurrentUser(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            throw new RuntimeException("User not authenticated");
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String githubId = oAuth2User.getAttribute("id").toString();

        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }

        return userOptional.get();
    }

    @GetMapping("/{category}")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(
            @PathVariable String category,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            Map<String, Object> progress = progressService.getWeeklyProgress(category, currentUser);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            log.error("Error fetching weekly progress for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch progress data"));
        }
    }

    @GetMapping("/{category}/all-time")
    public ResponseEntity<Map<String, Object>> getAllTimeStats(
            @PathVariable String category,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            Map<String, Object> stats = progressService.getAllTimeStats(category, currentUser);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching all-time stats for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch statistics"));
        }
    }
}