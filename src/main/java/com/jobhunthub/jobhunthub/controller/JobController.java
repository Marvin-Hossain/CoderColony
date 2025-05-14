package com.jobhunthub.jobhunthub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;
import com.jobhunthub.jobhunthub.dto.JobDTO;
import com.jobhunthub.jobhunthub.dto.UpdateJobRequestDTO;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.JobService;
import com.jobhunthub.jobhunthub.service.UserService;
import com.jobhunthub.jobhunthub.utils.AuthenticationUtils;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final UserService userService;

    public JobController(JobService jobService, UserService userService) {
        this.jobService = jobService;
        this.userService = userService;

    }

    // CRUD Endpoints

    // Create a job
    @PostMapping
    public ResponseEntity<JobDTO> createJob(@RequestBody CreateJobRequestDTO createJobRequestDTO, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        JobDTO createdJobDTO = jobService.createJob(createJobRequestDTO, currentUser);
        return new ResponseEntity<>(createdJobDTO, HttpStatus.CREATED);
    }

    // Get all jobs
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        List<JobDTO> jobDTOs = jobService.getJobsByUser(currentUser);
        return ResponseEntity.ok(jobDTOs);
    }

    // Get job by id
    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Long id, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        JobDTO jobDTO = jobService.getJobById(id, currentUser);
        return ResponseEntity.ok(jobDTO);
    }

    // Update a job
    @PutMapping("/{id}")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Long id, @RequestBody UpdateJobRequestDTO updateJobRequestDTO, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        JobDTO updatedJobDTO = jobService.updateJob(id, updateJobRequestDTO, currentUser);
        return ResponseEntity.ok(updatedJobDTO);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id, Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        jobService.deleteJob(id, currentUser);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // STATS Endpoints

    // Get total job count
    @GetMapping("/count")
    public Map<String, Long> getJobCount(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of("count", jobService.getJobCountByUser(currentUser));
    }

    // Get today's job count
    @GetMapping("/today-count")
    public Map<String, Long> getTodayCount(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of("count", jobService.getTodayCount(currentUser));
    }

    // Get dashboard stats with status breakdown
    @GetMapping("/dashboard-stats")
    public Map<String, Object> getDashboardStats(Authentication authentication) {
        User currentUser = AuthenticationUtils.getCurrentUser(authentication, userService);
        return Map.of("totalCount", jobService.getJobCountByUser(currentUser), "appliedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.APPLIED), "todayCount", jobService.getTodayCount(currentUser), "interviewedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.INTERVIEWED), "rejectedCount", jobService.getJobCountByUserAndStatus(currentUser, Job.Status.REJECTED));
    }
}
