package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByCategoryAndDateBetweenOrderByDate(String category, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(p.completionCount) FROM Progress p WHERE p.category = ?1")
    Integer getTotalCompletions(String category);

    @Query("SELECT AVG(p.completionCount) FROM Progress p WHERE p.category = ?1")
    Double getAverageCompletions(String category);

    @Query("SELECT MAX(p.completionCount) FROM Progress p WHERE p.category = ?1")
    Integer getBestDay(String category);

    List<Progress> findByCategory(String category);

    Optional<Progress> findByCategoryAndDate(String category, LocalDate date);
}