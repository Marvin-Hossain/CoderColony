package com.jobhunthub.jobhunthub.repository;

import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Find all jobs for a user
    List<Job> findByUser(User user);

    // Count total jobs for a user
    long countByUser(User user);

    // Count jobs by status for a user
    long countByUserAndStatus(User user, Job.Status status);

    // Count jobs created on a specific date for a user
    long countByCreatedAtAndUser(LocalDate createdAt, User user);

    // Get daily job counts within a date range
    @Query("SELECT j.createdAt as date, COUNT(j) as count FROM Job j " +
            "WHERE j.user = :user AND j.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY j.createdAt " +
            "ORDER BY j.createdAt")
    List<Object[]> getJobCountsByDateRange(User user, LocalDate startDate, LocalDate endDate);

    // Get count of jobs by status
    @Query("SELECT j.status, COUNT(j) FROM Job j WHERE j.user = :user GROUP BY j.status")
    List<Object[]> getStatusCounts(User user);

    // Get highest number of jobs submitted in a single day
    @Query("SELECT MAX(cnt) FROM " +
            "(SELECT COUNT(j) as cnt FROM Job j " +
            "WHERE j.user = :user " +
            "GROUP BY j.createdAt)")
    Integer findBestDayCount(User user);

    // Get count of distinct days with job submissions
    @Query("SELECT COUNT(DISTINCT j.createdAt) FROM Job j WHERE j.user = :user")
    Long countDistinctDates(User user);
}
