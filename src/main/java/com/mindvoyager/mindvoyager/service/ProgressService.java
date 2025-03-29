package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Progress;
import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.mindvoyager.mindvoyager.model.User;

@Service
public class ProgressService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressService.class);

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private JobService jobService;

    public Map<String, Object> getWeeklyProgress(String category, User user) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Chicago"));
        LocalDate startDate = today.minusDays(6);
        Map<String, Object> result = new HashMap<>();

        if (category.equals("jobs")) {
            // Get user-specific jobs
            List<Job> userJobs = jobService.getJobsByUser(user);

            // Filter jobs within the date range and group by date
            Map<LocalDate, Long> jobsByDate = userJobs.stream()
                    .filter(job -> job.getCreatedAt() != null
                            && !job.getCreatedAt().isBefore(startDate)
                            && !job.getCreatedAt().isAfter(today))
                    .collect(Collectors.groupingBy(
                            Job::getCreatedAt,
                            Collectors.counting()
                    ));

            // Format data for the response
            List<Map<String, Object>> chartData = new ArrayList<>();

            // Ensure all dates are included, even if no jobs
            for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                Map<String, Object> point = new HashMap<>();
                point.put("date", date.toString());
                point.put("count", jobsByDate.getOrDefault(date, 0L));
                chartData.add(point);
            }

            result.put("chartData", chartData);
            result.put("total", userJobs.size());
            result.put("todayCount", jobsByDate.getOrDefault(today, 0L));

            // Add status counts
            Map<Job.Status, Long> statusCounts = userJobs.stream()
                    .collect(Collectors.groupingBy(
                            Job::getStatus,
                            Collectors.counting()
                    ));

            result.put("applied", statusCounts.getOrDefault(Job.Status.APPLIED, 0L));
            result.put("interviewed", statusCounts.getOrDefault(Job.Status.INTERVIEWED, 0L));
            result.put("rejected", statusCounts.getOrDefault(Job.Status.REJECTED, 0L));
        }

        return result;
    }

    public Map<String, Object> getAllTimeStats(String category, User user) {
        Map<String, Object> stats = new HashMap<>();
        try {
            if (category.equals("jobs")) {
                // Get all jobs for the specific user
                List<Job> allJobs = jobService.getJobsByUser(user);

                // Group jobs by date and count
                Map<LocalDate, Long> jobsByDate = allJobs.stream()
                        .collect(Collectors.groupingBy(
                                Job::getCreatedAt,
                                Collectors.counting()
                        ));

                // Calculate stats
                int total = allJobs.size();
                double average = jobsByDate.isEmpty() ? 0.0 :
                        (double) total / jobsByDate.size();
                int bestDay = jobsByDate.values().stream()
                        .mapToInt(Long::intValue)
                        .max()
                        .orElse(0);

                // Count jobs by status
                Map<Job.Status, Long> statusCounts = allJobs.stream()
                        .collect(Collectors.groupingBy(
                                Job::getStatus,
                                Collectors.counting()
                        ));

                stats.put("total", total);
                stats.put("average", String.format("%.1f", average));
                stats.put("bestDay", bestDay);
                stats.put("applied", statusCounts.getOrDefault(Job.Status.APPLIED, 0L));
                stats.put("interviewed", statusCounts.getOrDefault(Job.Status.INTERVIEWED, 0L));
                stats.put("rejected", statusCounts.getOrDefault(Job.Status.REJECTED, 0L));
            } else {
                // For non-job categories, use existing logic
                Map<LocalDate, Integer> dailyTotals = progressRepository.findByCategory(category).stream()
                        .collect(Collectors.groupingBy(
                                Progress::getDate,
                                Collectors.summingInt(Progress::getCompletionCount)
                        ));

                int total = dailyTotals.values().stream().mapToInt(Integer::intValue).sum();
                double average = dailyTotals.isEmpty() ? 0.0 :
                        (double) total / dailyTotals.size();
                int bestDay = dailyTotals.values().stream()
                        .mapToInt(Integer::intValue)
                        .max()
                        .orElse(0);

                stats.put("total", total);
                stats.put("average", String.format("%.1f", average));
                stats.put("bestDay", bestDay);
            }
            return stats;
        } catch (Exception e) {
            logger.error("Error getting stats for category {}: {}", category, e.getMessage());
            return Map.of(
                    "total", 0,
                    "average", "0.0",
                    "bestDay", 0
            );
        }
    }
}