package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BehavioralQuestionRepository extends JpaRepository<BehavioralQuestion, Long> {
    @Query("SELECT COUNT(DISTINCT b.question) FROM BehavioralQuestion b WHERE b.createdAt = :date AND b.user = :user")
    long countByDateAndUser(LocalDate date, User user);

    @Query(value = "SELECT * FROM behavioral_questions WHERE (created_at <> CURRENT_DATE OR created_at IS NULL) " +
           "AND user_id = :userId ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    BehavioralQuestion findRandomQuestionForUser(Long userId);

    @Modifying
    @Query("UPDATE BehavioralQuestion t SET t.createdAt = NULL WHERE t.user = :user")
    void resetAllDatesForUser(User user);

    @Query("SELECT t FROM BehavioralQuestion t WHERE t.question = :question AND t.user = :user")
    BehavioralQuestion findByQuestionAndUser(String question, User user);

    List<BehavioralQuestion> findByUser(User user);
    
    long countByUser(User user);
} 