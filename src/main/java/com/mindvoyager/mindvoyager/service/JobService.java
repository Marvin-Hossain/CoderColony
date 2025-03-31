package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.repository.JobRepository;
import org.springframework.stereotype.Service;
import com.mindvoyager.mindvoyager.exception.GlobalExceptionHandler;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final ZoneId zoneId;

    public JobService(JobRepository jobRepository, ZoneId zoneId) {
        this.jobRepository = jobRepository;
        this.zoneId = zoneId;
    }

    // Basic CRUD operations - all include user security checks
    public Job createJob(Job job, User user) {
        job.setUser(user);
        job.setCreatedAt(LocalDate.now(zoneId));
        return jobRepository.save(job);
    }

    public List<Job> getJobsByUser(User user) {
        return jobRepository.findByUser(user);
    }

    public Job getJobById(Long id, User user) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id));
        // 404 if job doesn't belong to user (security through obscurity)
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

    // Stats methods for dashboard and progress tracking
    public Map<String, Object> getWeeklyJobStats(User user, LocalDate startDate, LocalDate endDate) {
        // Initialize with zero counts for all dates in range
        Map<LocalDate, Long> dateCountMap = new HashMap<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dateCountMap.put(date, 0L);
        }

        // Fill in actual counts and transform for frontend chart
        jobRepository.getJobCountsByDateRange(user, startDate, endDate)
                .forEach(count -> dateCountMap.put((LocalDate) count[0], ((Number) count[1]).longValue()));

        List<Map<String, Object>> chartData = dateCountMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", entry.getKey().toString());
                    point.put("count", entry.getValue());
                    return point;
                })
                .collect(Collectors.toList());

        // Get all status counts in one query
        Map<Job.Status, Long> statusCounts = jobRepository.getStatusCounts(user).stream()
                .collect(Collectors.toMap(
                        arr -> (Job.Status) arr[0],
                        arr -> ((Number) arr[1]).longValue()
                ));

        // Build response with all stats
        return Map.of(
                "chartData", chartData,
                "total", getJobCountByUser(user),
                "todayCount", getTodayCount(user),
                "applied", statusCounts.getOrDefault(Job.Status.APPLIED, 0L),
                "interviewed", statusCounts.getOrDefault(Job.Status.INTERVIEWED, 0L),
                "rejected", statusCounts.getOrDefault(Job.Status.REJECTED, 0L)
        );
    }

    public Map<String, Object> getAllTimeJobStats(User user) {
        long total = jobRepository.countByUser(user);
        long distinctDates = jobRepository.countDistinctDates(user);

        // Calculate daily average, handle division by zero
        double average = distinctDates > 0 ? (double) total / distinctDates : 0.0;

        // Get best day count (defaults to 0 if null)
        int bestDay = jobRepository.findBestDayCount(user) != null ?
                jobRepository.findBestDayCount(user) : 0;

        // Get status breakdown
        return Map.of(
                "total", total,
                "average", String.format("%.1f", average),
                "bestDay", bestDay,
                "applied", jobRepository.countByUserAndStatus(user, Job.Status.APPLIED),
                "interviewed", jobRepository.countByUserAndStatus(user, Job.Status.INTERVIEWED),
                "rejected", jobRepository.countByUserAndStatus(user, Job.Status.REJECTED)
        );
    }
}
