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
import java.util.Optional;
import java.time.ZoneId;
import org.springframework.context.ApplicationContext;
import com.mindvoyager.mindvoyager.repository.BehavioralQuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProgressService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressService.class);

    @Autowired
    private ProgressRepository progressRepository;
    
    @Autowired
    private JobService jobService;

    @Autowired
    private ApplicationContext applicationContext;

    public Map<String, Object> getWeeklyProgress(String category) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Chicago"));
        LocalDate startDate = today.minusDays(6);
        List<Progress> weeklyProgress;
        Map<LocalDate, Integer> dateToCount;

        try {
            if (category.equals("behavioral")) {
                // Get behavioral question counts directly from BehavioralQuestionRepository
                BehavioralQuestionRepository behavioralRepo = 
                    (BehavioralQuestionRepository) applicationContext.getBean("behavioralQuestionRepository");
                
                Map<LocalDate, Integer> behavioralCounts = new HashMap<>();
                for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                    long count = behavioralRepo.countByDate(date);
                    behavioralCounts.put(date, (int) count);
                }
                
                // Convert to dateToCount format
                dateToCount = behavioralCounts;
            } else {
                // Original logic for other categories
                weeklyProgress = progressRepository.findByCategoryAndDateBetweenOrderByDate(
                    category, startDate, today);
                    
                dateToCount = weeklyProgress.stream()
                    .collect(Collectors.groupingBy(
                        Progress::getDate,
                        Collectors.summingInt(Progress::getCompletionCount)
                    ));
            }
        } catch (Exception e) {
            weeklyProgress = new ArrayList<>();
            dateToCount = new HashMap<>();
        }

        // If it's jobs category, get counts for each day from JobService
        if (category.equals("jobs")) {
            List<Job> allJobs = jobService.getAllJobs();
            Map<LocalDate, Long> jobsByDate = allJobs.stream()
                .filter(job -> job.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                    Job::getCreatedAt,
                    Collectors.counting()
                ));

            // Update dateToCount with job counts
            for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
                dateToCount.put(date, jobsByDate.getOrDefault(date, 0L).intValue());
            }
        }

        List<LocalDate> allDates = new ArrayList<>();
        List<Integer> allCompletions = new ArrayList<>();
        List<String> dateLabels = new ArrayList<>();
        
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            allDates.add(date);
            int count = dateToCount.getOrDefault(date, 0);
            allCompletions.add(count);
            String dayOfWeek = date.getDayOfWeek().toString().substring(0, 3);
            String monthDay = date.getMonthValue() + "/" + date.getDayOfMonth();
            dateLabels.add(dayOfWeek + "\n(" + monthDay + ")");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("dates", dateLabels);
        response.put("completions", allCompletions);
        
        return response;
    }

    public Map<String, Object> getAllTimeStats(String category) {
        Map<String, Object> stats = new HashMap<>();
        try {
            if (category.equals("behavioral")) {
                BehavioralQuestionRepository behavioralRepo = 
                    (BehavioralQuestionRepository) applicationContext.getBean("behavioralQuestionRepository");
                
                // Get total unique questions answered
                long total = behavioralRepo.countTotalAnswered();
                
                // Get daily counts and convert to Map
                List<Object[]> dailyCountsList = behavioralRepo.getDailyCounts();
                Map<LocalDate, Long> dailyCounts = dailyCountsList.stream()
                    .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> ((Number) row[1]).longValue()
                    ));
                
                double average = dailyCounts.isEmpty() ? 0.0 : 
                    (double) total / dailyCounts.size();
                
                long bestDay = dailyCounts.values().stream()
                    .mapToLong(Long::longValue)
                    .max()
                    .orElse(0);

                stats.put("total", total);
                stats.put("average", String.format("%.1f", average));
                stats.put("bestDay", bestDay);
            } else if (category.equals("jobs")) {
                // Get all jobs with their creation dates
                List<Job> allJobs = jobService.getAllJobs();
                
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

    public void logProgress(String category, int count) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Chicago"));
        Optional<Progress> existingProgress = progressRepository.findByCategoryAndDate(category, today);
        
        if (existingProgress.isPresent()) {
            Progress progress = existingProgress.get();
            progress.setCompletionCount(progress.getCompletionCount() + count);
            progressRepository.save(progress);
        } else {
            Progress progress = new Progress();
            progress.setCategory(category);
            progress.setDate(today);
            progress.setCompletionCount(count);
            progressRepository.save(progress);
        }
    }

    public void decrementProgress(String category, LocalDate date) {
        Optional<Progress> progressOpt = progressRepository.findByCategoryAndDate(category, date);
        if (progressOpt.isPresent()) {
            Progress progress = progressOpt.get();
            if (progress.getCompletionCount() > 0) {
                progress.setCompletionCount(progress.getCompletionCount() - 1);
                if (progress.getCompletionCount() == 0) {
                    progressRepository.delete(progress);
                } else {
                    progressRepository.save(progress);
                }
            }
        }
    }
}