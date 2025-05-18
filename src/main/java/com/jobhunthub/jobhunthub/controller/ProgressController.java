package com.jobhunthub.jobhunthub.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.service.JobService;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final JobService jobService;
    private final ZoneId zoneId;

    public ProgressController(JobService jobService, ZoneId zoneId) {
        this.jobService = jobService;
        this.zoneId = zoneId;
    }

    // STATS Endpoints

    // Get weekly stats for a category (currently only jobs)
    @GetMapping("/{category}")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(@PathVariable String category, @AuthenticationPrincipal UserPrincipal me) {
        if (category.equals("jobs")) {
            LocalDate today = LocalDate.now(zoneId);
            return ResponseEntity.ok(jobService.getWeeklyJobStats(me.getDomainUser(), today.minusDays(6), today));
        }

        return ResponseEntity.ok(new HashMap<>()); // Ready for future categories
    }

    // Get all-time stats for a category (currently only jobs)
    @GetMapping("/{category}/all-time")
    public ResponseEntity<Map<String, Object>> getAllTimeStats(@PathVariable String category, @AuthenticationPrincipal UserPrincipal me) {
        if (category.equals("jobs")) {
            return ResponseEntity.ok(jobService.getAllTimeJobStats(me.getDomainUser()));
        }

        return ResponseEntity.ok(new HashMap<>()); // Ready for future categories
    }
}