package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import com.mindvoyager.mindvoyager.model.User;
import java.util.List;

@Repository
public interface TechnicalQuestionRepository extends JpaRepository<TechnicalQuestion, Long> {
    @Query("SELECT COUNT(DISTINCT t.question) FROM TechnicalQuestion t WHERE t.createdAt = :date AND t.user = :user")
    long countByDateAndUser(LocalDate date, User user);

    @Query(value = "SELECT * FROM technical_questions WHERE (created_at <> CURRENT_DATE OR created_at IS NULL) " +
           "AND user_id = :userId ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    TechnicalQuestion findRandomQuestionForUser(Long userId);

    @Modifying
    @Query("UPDATE TechnicalQuestion t SET t.createdAt = NULL WHERE t.user = :user")
    void resetAllDatesForUser(User user);

    @Query("SELECT t FROM TechnicalQuestion t WHERE t.question = :question AND t.user = :user")
    TechnicalQuestion findByQuestionAndUser(String question, User user);

    List<TechnicalQuestion> findByUser(User user);
    
    long countByUser(User user);
}