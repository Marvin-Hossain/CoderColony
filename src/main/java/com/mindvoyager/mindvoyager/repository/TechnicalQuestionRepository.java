package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface TechnicalQuestionRepository extends JpaRepository<TechnicalQuestion, Long> {
    @Query("SELECT COUNT(DISTINCT t.question) FROM TechnicalQuestion t WHERE t.createdAt = :date")
    long countByDate(LocalDate date);

    @Query(value = "SELECT * FROM technical_questions WHERE created_at <> CURRENT_DATE OR created_at IS NULL " +
           "ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    TechnicalQuestion findRandomQuestion();

    @Modifying
    @Query("UPDATE TechnicalQuestion t SET t.createdAt = NULL")
    void resetAllDates();

    @Query("SELECT t FROM TechnicalQuestion t WHERE t.question = :question")
    TechnicalQuestion findByQuestion(String question);
}