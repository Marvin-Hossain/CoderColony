package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.service.JobService;
import com.mindvoyager.mindvoyager.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class JobController {

    private final JobService jobService;
    private final UserService userService;
    
    // Constructor injection instead of field injection
    public JobController(JobService jobService, UserService userService) {
        this.jobService = jobService;
        this.userService = userService;
    }
    
    // Helper method to get current user
    private User getCurrentUser(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            throw new RuntimeException("User not authenticated");
        }
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        
        // Direct toString() call as in the original code
        String githubId = oAuth2User.getAttribute("id").toString();
        
        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        return userOptional.get();
    }

    // Create a new job
    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Job createdJob = jobService.createJob(job, currentUser);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    // Get all jobs for current user
    @GetMapping
    public List<Job> getAllJobs(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return jobService.getJobsByUser(currentUser);
    }

    // Get job by id
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return jobService.getJobById(id, currentUser);
    }

    // Update a job
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job jobDetails, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return jobService.updateJob(id, jobDetails, currentUser);
    }

    // Update job status
    @PatchMapping("/{id}/status")
    public Job updateJobStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Job.Status status = Job.Status.valueOf(payload.get("status"));
        return jobService.updateJobStatus(id, status, currentUser);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        jobService.deleteJob(id, currentUser);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // Get job count for current user
    @GetMapping("/count")
    public Map<String, Long> getJobCount(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        long count = jobService.getJobCountByUser(currentUser);
        return Map.of("count", count);
    }
    
    // Get job counts by status for dashboard
    @GetMapping("/dashboard-stats")
    public Map<String, Object> getDashboardStats(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        
        long totalCount = jobService.getJobCountByUser(currentUser);
        long appliedCount = jobService.getJobCountByUserAndStatus(currentUser, Job.Status.APPLIED);
        long interviewedCount = jobService.getJobCountByUserAndStatus(currentUser, Job.Status.INTERVIEWED);
        long rejectedCount = jobService.getJobCountByUserAndStatus(currentUser, Job.Status.REJECTED);
        
        return Map.of(
            "totalCount", totalCount,
            "appliedCount", appliedCount,
            "interviewedCount", interviewedCount,
            "rejectedCount", rejectedCount
        );
    }
}
