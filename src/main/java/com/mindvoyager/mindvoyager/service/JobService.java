package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.repository.JobRepository;
import org.springframework.stereotype.Service;
import com.mindvoyager.mindvoyager.exception.GlobalExceptionHandler;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final ZoneId zoneId;

    public JobService(JobRepository jobRepository, ZoneId zoneId) {
        this.jobRepository = jobRepository;
        this.zoneId = zoneId;
    }

    // Create a new job with user
    public Job createJob(Job job, User user) {
        job.setUser(user);
        job.setCreatedAt(LocalDate.now(zoneId));
        return jobRepository.save(job);
    }

    // Get all jobs for a specific user
    public List<Job> getJobsByUser(User user) {
        return jobRepository.findByUser(user);
    }

    // Get job by id (with security check)
    public Job getJobById(Long id, User user) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id));

        // Security check: ensure the job belongs to the requesting user
        if (!job.getUser().getId().equals(user.getId())) {
            throw new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id);
        }

        return job;
    }

    // Update job (with security check)
    public Job updateJob(Long id, Job jobDetails, User user) {
        Job job = getJobById(id, user);
        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setStatus(jobDetails.getStatus());
        return jobRepository.save(job);
    }

    // Update job status (with security check)
    public Job updateJobStatus(Long id, Job.Status status, User user) {
        Job job = getJobById(id, user);
        job.setStatus(status);
        return jobRepository.save(job);
    }

    // Delete job (with security check)
    public void deleteJob(Long id, User user) {
        Job job = getJobById(id, user);
        jobRepository.delete(job);
    }

    // Get job count for a specific user
    public long getJobCountByUser(User user) {
        return jobRepository.countByUser(user);
    }

    // Get job count by status for a specific user
    public long getJobCountByUserAndStatus(User user, Job.Status status) {
        return jobRepository.countByUserAndStatus(user, status);
    }

    // Get job count for today
    public long getTodayCount(User user) {
        return jobRepository.countByCreatedAtAndUser(LocalDate.now(zoneId), user);
    }
}
