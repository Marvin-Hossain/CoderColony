package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
public class ProgressController {
    @Autowired
    private ProgressService progressService;

    @GetMapping("/{category}")
    public Map<String, Object> getWeeklyProgress(@PathVariable String category) {
        return progressService.getWeeklyProgress(category);
    }

    @GetMapping("/{category}/all-time")
    public Map<String, Object> getAllTimeStats(@PathVariable String category) {
        return progressService.getAllTimeStats(category);
    }

    @PostMapping("/{category}")
    public void logProgress(@PathVariable String category, @RequestBody Map<String, Integer> payload) {
        progressService.logProgress(category, payload.get("count"));
    }

    @DeleteMapping("/{category}")
    public void decrementProgress(@PathVariable String category, @RequestBody Map<String, String> payload) {
        LocalDate date = LocalDate.parse(payload.get("date"));
        progressService.decrementProgress(category, date);
    }
}