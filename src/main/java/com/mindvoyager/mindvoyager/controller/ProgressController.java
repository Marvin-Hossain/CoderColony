package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.UserService;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.mindvoyager.mindvoyager.utils.AuthenticationUtils;
import com.mindvoyager.mindvoyager.service.JobService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final JobService jobService;
    private final UserService userService;
    private final ZoneId zoneId;

    public ProgressController(JobService jobService, UserService userService, ZoneId zoneId) {
        this.jobService = jobService;
        this.userService = userService;
        this.zoneId = zoneId;
    }

    // Get weekly stats for a category (currently only jobs)
    @GetMapping("/{category}")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(
            @PathVariable String category,
            Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);

        if (category.equals("jobs")) {
            LocalDate today = LocalDate.now(zoneId);
            return ResponseEntity.ok(jobService.getWeeklyJobStats(currentUser, today.minusDays(6), today));
        }

        return ResponseEntity.ok(new HashMap<>()); // Ready for future categories
    }

    // Get all-time stats for a category (currently only jobs)
    @GetMapping("/{category}/all-time")
    public ResponseEntity<Map<String, Object>> getAllTimeStats(
            @PathVariable String category,
            Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);

        if (category.equals("jobs")) {
            return ResponseEntity.ok(jobService.getAllTimeJobStats(currentUser));
        }

        return ResponseEntity.ok(new HashMap<>()); // Ready for future categories
    }
}