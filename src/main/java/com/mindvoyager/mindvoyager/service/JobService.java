package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    // Create a new job
    public Job createJob(Job job) {
        job.setCreatedAt(LocalDate.now(ZoneId.of("America/Chicago"))); // Set CST timezone
        return jobRepository.save(job);
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();
        // Set creation date for any null dates
        jobs.forEach(job -> {
            if (job.getCreatedAt() == null) {
                job.setCreatedAt(LocalDate.now(ZoneId.of("America/Chicago")));
                jobRepository.save(job);
            }
        });
        return jobs;
    }

    // Get a job by ID
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    // Update a job
    public Job updateJob(Long id, Job jobDetails) {
        Job job = getJobById(id);
        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setStatus(jobDetails.getStatus());
        return jobRepository.save(job);
    }

    public Job updateJobStatus(Long id, Job.Status status) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        job.setStatus(status);
        return jobRepository.save(job);
    }

    // Delete a job
    public void deleteJob(Long id) {
        Job job = getJobById(id); // Ensure job exists
        jobRepository.delete(job);
    }

    // Get job count for today only (CST)
    public long getJobCount() {
        LocalDate today = LocalDate.now(ZoneId.of("America/Chicago"));
        return jobRepository.findAll().stream()
            .filter(job -> job.getCreatedAt() != null && job.getCreatedAt().equals(today))
            .count();
    }
}
