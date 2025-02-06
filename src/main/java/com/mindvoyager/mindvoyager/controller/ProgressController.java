package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.ProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class ProgressController {
    
    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/{category}")
    public ResponseEntity<Map<String, Object>> getWeeklyProgress(@PathVariable String category) {
        try {
            Map<String, Object> progress = progressService.getWeeklyProgress(category);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            log.error("Error fetching weekly progress for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch progress data"));
        }
    }

    @GetMapping("/{category}/all-time")
    public ResponseEntity<Map<String, Object>> getAllTimeStats(@PathVariable String category) {
        try {
            Map<String, Object> stats = progressService.getAllTimeStats(category);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching all-time stats for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    @PostMapping("/{category}")
    public ResponseEntity<?> logProgress(
            @PathVariable String category,
            @RequestBody Map<String, Integer> payload) {
        try {
            progressService.logProgress(category, payload.get("count"));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error logging progress for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to log progress"));
        }
    }

    @DeleteMapping("/{category}")
    public void decrementProgress(@PathVariable String category, @RequestBody Map<String, String> payload) {
        LocalDate date = LocalDate.parse(payload.get("date"));
        progressService.decrementProgress(category, date);
    }
}