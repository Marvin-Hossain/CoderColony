// package com.mindvoyager.mindvoyager.service;

// import org.springframework.stereotype.Service;

// import java.time.LocalDate;
// import java.util.HashMap;
// import java.util.Map;
// import java.time.ZoneId;

// import com.mindvoyager.mindvoyager.model.User;

// @Service
// public class ProgressService {

//     private final JobService jobService;
//     private final ZoneId zoneId;

//     public ProgressService(JobService jobService, ZoneId zoneId) {
//         this.jobService = jobService;
//         this.zoneId = zoneId;
//     }

//     public Map<String, Object> getWeeklyProgress(String category, User user) {
//         LocalDate today = LocalDate.now(zoneId);
//         LocalDate startDate = today.minusDays(6);
        
//         if (category.equals("jobs")) {
//             return jobService.getWeeklyJobStats(user, startDate, today);
//         }
        
//         return new HashMap<>();
//     }

//     public Map<String, Object> getAllTimeStats(String category, User user) {
//         if (category.equals("jobs")) {
//             return jobService.getAllTimeJobStats(user);
//         }
//         return new HashMap<>();
//     }
// }