package com.jobhunthub.jobhunthub.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;
import com.jobhunthub.jobhunthub.dto.JobDTO;
import com.jobhunthub.jobhunthub.dto.UpdateJobRequestDTO;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.JobRepository;

@Service
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);
    private final JobRepository jobRepository;
    private final ZoneId zoneId;

    public JobService(JobRepository jobRepository, ZoneId zoneId) {
        this.jobRepository = jobRepository;
        this.zoneId = zoneId;
    }

    // Basic CRUD operations - all include user security checks
    // Creates a new job
    @Transactional
    public JobDTO createJob(CreateJobRequestDTO dto, User user) {
        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());

        validateJob(job);

        job.setStatus(Job.Status.APPLIED);
        job.setUser(user);
        job.setCreatedAt(LocalDate.now(zoneId));

        Job savedJob = jobRepository.save(job);
        return JobDTO.fromEntity(savedJob);
    }

    // Gets all jobs for a user
    public List<JobDTO> getJobsByUser(User user) {
        return jobRepository.findByUser(user)
                .stream()
                .map(JobDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Gets a job by id
    public JobDTO getJobById(Long id, User user) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id));
        if (!job.getUser().getId().equals(user.getId())) {
            throw new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id); // Security through obscurity
        }
        return JobDTO.fromEntity(job);
    }

    // Updates a job
    @Transactional
    public JobDTO updateJob(Long id, UpdateJobRequestDTO dto, User user) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id));
        
        if (!job.getUser().getId().equals(user.getId())) {
            throw new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id);
        }

        job.setTitle(dto.getTitle());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        
        validateJob(job);

        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            try {
                Job.Status newStatus = Job.Status.valueOf(dto.getStatus().toUpperCase());
                job.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new GlobalExceptionHandler.InvalidRequestException("Invalid status value: " + dto.getStatus());
            }
        }

        Job updatedJob = jobRepository.save(job);
        return JobDTO.fromEntity(updatedJob);
    }

    // Deletes a job
    @Transactional
    public void deleteJob(Long id, User user) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id));
        if (!job.getUser().getId().equals(user.getId())) {
            throw new GlobalExceptionHandler.ResourceNotFoundException("Job", "id", id); 
        }
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

    // Validates a job
    private void validateJob(Job job) {
        if (job.getTitle() == null || job.getTitle().trim().isEmpty() ||
            job.getCompany() == null || job.getCompany().trim().isEmpty() ||
            job.getLocation() == null || job.getLocation().trim().isEmpty()) {
            throw new GlobalExceptionHandler.InvalidRequestException("Title, company, and location are required");
        }
        // Simplified location validation for brevity, consider more robust validation
        if (!job.getLocation().equals("Remote") && 
            !job.getLocation().matches("^[A-Za-z\\s.,'-]+,\\s*[A-Z]{2}$") && // Allow more chars for city
            !job.getLocation().matches("^[A-Za-z\\s.,'-]+$")) { // Allow city name only if no state
            logger.warn("Job location validation failed for: {}", job.getLocation());
        }
    }
}
