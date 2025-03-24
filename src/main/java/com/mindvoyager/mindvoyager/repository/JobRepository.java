package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.Job;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Find jobs by user
    List<Job> findByUser(User user);
    
    // Count jobs by user
    long countByUser(User user);
    
    // Find jobs by user and status
    List<Job> findByUserAndStatus(User user, Job.Status status);
    
    // Count jobs by user and status
    long countByUserAndStatus(User user, Job.Status status);

    long countByCreatedAtAndUser(LocalDate createdAt, User user);
}
