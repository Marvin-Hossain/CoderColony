package com.jobhunthub.jobhunthub.controller;

import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.JobService;
import com.jobhunthub.jobhunthub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.jobhunthub.jobhunthub.utils.AuthenticationUtils;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final UserService userService;

    // Constructor injection instead of field injection
    public JobController(JobService jobService, UserService userService) {
        this.jobService = jobService;
        this.userService = userService;

    }

    // CRUD Endpoints
    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        Job createdJob = jobService.createJob(job, currentUser);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Job> getAllJobs(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return jobService.getJobsByUser(currentUser);
    }

    // Get job by id
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return jobService.getJobById(id, currentUser);
    }

    // Update a job
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job jobDetails, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return jobService.updateJob(id, jobDetails, currentUser);
    }

    // Update job status
    @PatchMapping("/{id}/status")
    public Job updateJobStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        Job.Status status = Job.Status.valueOf(payload.get("status"));
        return jobService.updateJobStatus(id, status, currentUser);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        jobService.deleteJob(id, currentUser);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // Stats Endpoints
    @GetMapping("/count")
    public Map<String, Long> getJobCount(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of("count", jobService.getJobCountByUser(currentUser));
    }

    @GetMapping("/today-count")
    public Map<String, Long> getTodayCount(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of("count", jobService.getTodayCount(currentUser));
    }

    // Dashboard stats with status breakdown
    @GetMapping("/dashboard-stats")
    public Map<String, Object> getDashboardStats(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of(
                "totalCount", jobService.getJobCountByUser(currentUser),
                "appliedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.APPLIED),
                "todayCount", jobService.getTodayCount(currentUser),
                "interviewedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.INTERVIEWED),
                "rejectedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.REJECTED)
        );
    }
}
