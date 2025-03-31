package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.Question;
import com.mindvoyager.mindvoyager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mindvoyager.mindvoyager.model.Question.QuestionType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    // Count completed questions for a specific date, user, and question type
    @Query("SELECT COUNT(DISTINCT q.question) FROM Question q WHERE q.updatedAt = :date AND q.user = :user AND q.type = :type")
    long countByDateAndUserAndType(LocalDate date, User user, QuestionType type);

    // Find a random unanswered question for today
    @Query(value = "SELECT * FROM questions WHERE (updated_at <> CURRENT_DATE OR updated_at IS NULL) " +
            "AND user_id = :userId AND type = :type ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Question findRandomQuestionForUserAndType(Long userId, String type);

    // Reset all questions to unanswered state for a user and type
    @Modifying
    @Query("UPDATE Question t SET t.updatedAt = NULL WHERE t.user = :user AND t.type = :type")
    void resetAllDatesForUserAndType(User user, QuestionType type);

    // Find a specific question by its text, user, and type
    @Query("SELECT t FROM Question t WHERE t.question = :question AND t.user = :user AND t.type = :type")
    Question findByQuestionAndUserAndType(String question, User user, QuestionType type);

    // Get all questions for a specific user and type
    List<Question> findByUserAndType(User user, QuestionType type);
} 