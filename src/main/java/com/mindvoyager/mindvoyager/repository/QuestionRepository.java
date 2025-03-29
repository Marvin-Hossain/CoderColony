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
    @Query("SELECT COUNT(DISTINCT q.question) FROM Question q WHERE q.updatedAt = :date AND q.user = :user AND q.type = :type")
    long countByDateAndUserAndType(LocalDate date, User user, QuestionType type);

    @Query(value = "SELECT * FROM questions WHERE (updated_at <> CURRENT_DATE OR updated_at IS NULL) " +
           "AND user_id = :userId AND type = :type ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Question findRandomQuestionForUserAndType(Long userId, String type);

    @Modifying
    @Query("UPDATE Question t SET t.updatedAt = NULL WHERE t.user = :user AND t.type = :type")
    void resetAllDatesForUserAndType(User user, QuestionType type);

    @Query("SELECT t FROM Question t WHERE t.question = :question AND t.user = :user AND t.type = :type")
    Question findByQuestionAndUserAndType(String question, User user, QuestionType type);

    List<Question> findByUserAndType(User user, QuestionType type);
    
    long countByUserAndType(User user, QuestionType type);

    List<Question> findByUser(User user);
    
    long countByUser(User user);
} 