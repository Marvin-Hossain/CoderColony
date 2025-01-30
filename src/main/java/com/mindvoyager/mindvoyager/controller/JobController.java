package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class JobController {

    @Autowired
    private JobService jobService;

    // Create a new job
    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }

    // Get all jobs
    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    // Get a job by ID
    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    // Update a job
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        return jobService.updateJob(id, jobDetails);
    }

    @PatchMapping("/{id}/status")
    public Job updateJobStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Job.Status status = Job.Status.valueOf(payload.get("status"));
        return jobService.updateJobStatus(id, status);
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public String deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return "Job deleted successfully!";
    }

    // Add this new endpoint
    @GetMapping("/count")
    public Map<String, Long> getJobCount() {
        long count = jobService.getJobCount();
        return Map.of("count", count);
    }
}
