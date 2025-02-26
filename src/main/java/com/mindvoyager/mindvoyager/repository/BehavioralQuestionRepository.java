package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
@Repository
public interface BehavioralQuestionRepository extends JpaRepository<BehavioralQuestion, Long> {
    @Query("SELECT COUNT(DISTINCT b.question) FROM BehavioralQuestion b WHERE b.createdAt = :date")
    long countByDate(LocalDate date);

    @Query(value = "SELECT * FROM behavioral_questions WHERE created_at <> CURRENT_DATE OR created_at IS NULL " +
           "ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    BehavioralQuestion findRandomQuestion();

    @Modifying
    @Query("UPDATE BehavioralQuestion t SET t.createdAt = NULL")
    void resetAllDates();

    @Query("SELECT t FROM BehavioralQuestion t WHERE t.question = :question")
    BehavioralQuestion findByQuestion(String question);
} 