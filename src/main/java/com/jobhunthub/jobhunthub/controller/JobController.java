package com.jobhunthub.jobhunthub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;
import com.jobhunthub.jobhunthub.dto.JobDTO;
import com.jobhunthub.jobhunthub.dto.UpdateJobRequestDTO;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;

    }

    // CRUD Endpoints

    // Create a job
    @PostMapping
    public ResponseEntity<JobDTO> createJob(@RequestBody CreateJobRequestDTO createJobRequestDTO, @AuthenticationPrincipal UserPrincipal me) {
        JobDTO createdJobDTO = jobService.createJob(createJobRequestDTO, me.getDomainUser());
        return new ResponseEntity<>(createdJobDTO, HttpStatus.CREATED);
    }

    // Get all jobs
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs(@AuthenticationPrincipal UserPrincipal me) {
        List<JobDTO> jobDTOs = jobService.getJobsByUser(me.getDomainUser());
        return ResponseEntity.ok(jobDTOs);
    }

    // Get job by id
    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal me) {
        JobDTO jobDTO = jobService.getJobById(id, me.getDomainUser());
        return ResponseEntity.ok(jobDTO);
    }

    // Update a job
    @PutMapping("/{id}")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Long id, @RequestBody UpdateJobRequestDTO updateJobRequestDTO, @AuthenticationPrincipal UserPrincipal me) {
        JobDTO updatedJobDTO = jobService.updateJob(id, updateJobRequestDTO, me.getDomainUser());
        return ResponseEntity.ok(updatedJobDTO);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal me) {
        jobService.deleteJob(id, me.getDomainUser());
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // STATS Endpoints

    // Get total job count
    @GetMapping("/count")
    public Map<String, Long> getJobCount(@AuthenticationPrincipal UserPrincipal me) {
        return Map.of("count", jobService.getJobCountByUser(me.getDomainUser()));
    }

    // Get today's job count
    @GetMapping("/today-count")
    public Map<String, Long> getTodayCount(@AuthenticationPrincipal UserPrincipal me) {
        return Map.of("count", jobService.getTodayCount(me.getDomainUser()));
    }

    // Get dashboard stats with status breakdown
    @GetMapping("/dashboard-stats")
    public Map<String, Object> getDashboardStats(@AuthenticationPrincipal UserPrincipal me) {
        return Map.of("totalCount", jobService.getJobCountByUser(me.getDomainUser()), "appliedCount", jobService.getJobCountByUserAndStatus(me.getDomainUser(), Job.Status.APPLIED), "todayCount", jobService.getTodayCount(me.getDomainUser()), "interviewedCount", jobService.getJobCountByUserAndStatus(me.getDomainUser(), Job.Status.INTERVIEWED), "rejectedCount", jobService.getJobCountByUserAndStatus(me.getDomainUser(), Job.Status.REJECTED));
    }
}
