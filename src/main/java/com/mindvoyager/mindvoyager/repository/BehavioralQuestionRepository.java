package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface BehavioralQuestionRepository extends JpaRepository<BehavioralQuestion, Long> {
    @Query("SELECT COUNT(DISTINCT b.question) FROM BehavioralQuestion b WHERE b.createdAt = :date")
    long countByDate(LocalDate date);

    @Query(value = "SELECT * FROM behavioral_questions WHERE question NOT IN " +
           "(SELECT question FROM behavioral_questions WHERE created_at = CURRENT_DATE AND response_text IS NOT NULL) " +
           "ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    BehavioralQuestion findRandomQuestion();

    @Query("SELECT b FROM BehavioralQuestion b WHERE b.question = :question AND b.createdAt = :date ORDER BY id ASC")
    List<BehavioralQuestion> findAllByQuestionAndDate(String question, LocalDate date);

    @Query("SELECT COUNT(DISTINCT b.question) FROM BehavioralQuestion b WHERE b.responseText IS NOT NULL")
    long countTotalAnswered();

    @Query("SELECT b.createdAt as date, COUNT(DISTINCT b.question) as count FROM BehavioralQuestion b " +
           "WHERE b.responseText IS NOT NULL GROUP BY b.createdAt")
    List<Object[]> getDailyCounts();
} 