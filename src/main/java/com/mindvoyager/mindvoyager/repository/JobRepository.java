package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // No extra methods are needed for basic CRUD functionality.
}
