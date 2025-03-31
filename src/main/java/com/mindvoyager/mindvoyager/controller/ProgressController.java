package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.ProgressService;
import com.mindvoyager.mindvoyager.service.UserService;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.mindvoyager.mindvoyager.utils.AuthenticationUtils;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final UserService userService;

    public ProgressController(ProgressService progressService, UserService userService) {
        this.progressService = progressService;
        this.userService = userService;
    }

    @GetMapping("/{category}")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(
            @PathVariable String category,
            Authentication authentication) {
            User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
            Map<String, Object> progress = progressService.getWeeklyProgress(category, currentUser);
            return ResponseEntity.ok(progress);
    }

    @GetMapping("/{category}/all-time")
    public ResponseEntity<Map<String, Object>> getAllTimeStats(
            @PathVariable String category,
            Authentication authentication) {
            User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
            Map<String, Object> stats = progressService.getAllTimeStats(category, currentUser);
            return ResponseEntity.ok(stats);
    }
}