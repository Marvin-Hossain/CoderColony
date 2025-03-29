package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Question;
import com.mindvoyager.mindvoyager.repository.QuestionRepository;
import com.mindvoyager.mindvoyager.model.Question.QuestionType;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import com.mindvoyager.mindvoyager.model.User;

@Service
public class QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    private final QuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    // Constructor injection
    public QuestionService(
            QuestionRepository repository,
            OpenAIService openAIService) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = new ObjectMapper();
    }

    // Gets a random unanswered question for the user
    public Question getRandomQuestion(User user, QuestionType type) {
        try {
            Question question = repository.findRandomQuestionForUserAndType(user.getId(), type.toString());
            if (question == null) {
                // Return a special Question indicating no more questions
                Question noMoreQuestions = new Question();
                noMoreQuestions.setQuestion("No more questions for today! Please reset or come back tomorrow!");
                return noMoreQuestions;
            }
            return question;
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new RuntimeException("Failed to get random question", e);
        }
    }

    private static final String TECHNICAL_EVALUATION_PROMPT_TEMPLATE =
            "You are an experienced technical interview coach specializing in technical questions. " +
                    "Evaluate responses based on:\n" +
                    "1. Technical accuracy and understanding\n" +
                    "2. Problem-solving approach\n" +
                    "3. Code quality and best practices (if code is involved)\n" +
                    "4. Communication of technical concepts\n\n" +
                    "Question: '%s'\n" +
                    "Response: '%s'\n\n" +
                    "Provide feedback in this JSON format:\n" +
                    "{\n" +
                    "  \"rating\": <number 1-10>,\n" +
                    "  \"feedback\": \"<Start with technical strengths, then areas for improvement, and end with actionable tips.>\"\n" +
                    "}";

    private static final String BEHAVIORAL_EVALUATION_PROMPT_TEMPLATE =
            "           You are an experienced technical interview coach specializing in behavioral questions. " +
                    "Evaluate responses using the STAR method (Situation, Task, Action, Result). " +
                    "Be constructive but firm in your feedback. " +
                    "For each response, analyze:\n" +
                    "1. Structure and completeness\n" +
                    "2. Specific examples and details\n" +
                    "3. Professional impact and results\n" +
                    "4. Communication clarity\n\n" +
                    "Question: '%s'\n" +
                    "Response: '%s'\n\n" +
                    "Provide feedback in this JSON format:\n" +
                    "{\n" +
                    "  \"rating\": <number 1-10>,\n" +
                    "  \"feedback\": \"<Start with strengths, then areas for improvement, and end with actionable tips.>\"\n" +
                    "}";

    // Sends response to OpenAI for evaluation and updates question with feedback
    public Question evaluateResponse(String question, String response, User user, QuestionType type) {
        try {
            Question questionEntity = repository.findByQuestionAndUserAndType(question, user, type);
            if (questionEntity == null) {
                throw new RuntimeException("No existing question found to update.");
            }
            String prompt = type == Question.QuestionType.BEHAVIORAL ?
                    BEHAVIORAL_EVALUATION_PROMPT_TEMPLATE :
                    TECHNICAL_EVALUATION_PROMPT_TEMPLATE;

            String gptResponse = openAIService.getResponse(response,
                    String.format(prompt, question, response));
            JsonNode jsonResponse = objectMapper.readTree(gptResponse);

            updateQuestion(questionEntity, response, jsonResponse);
            return repository.save(questionEntity);
        } catch (Exception e) {
            logger.error("Error evaluating response", e);
            throw new RuntimeException("Failed to evaluate response", e);
        }
    }

    // Updates question with response and AI feedback
    private void updateQuestion(Question question, String response, JsonNode evaluation) {
        question.setResponseText(response);
        int rating = evaluation.get("rating").asInt();
        question.setRating(evaluation.get("rating").asInt());
        question.setFeedback(evaluation.get("feedback").asText());
        // Mark as completed if rating > 5
        if (rating > 5) {
            question.setUpdatedAt(LocalDate.now());
        } else {
            question.setUpdatedAt(null); // Reset date if rating is too low
        }
    }

    // Gets count of successfully answered questions for today
    public long getTodayCount(User user, QuestionType type) {
        return repository.countByDateAndUserAndType(LocalDate.now(), user, type);
    }

    // Resets all questions of specific type for user (marks them as unanswered)
    @Transactional
    public void resetAllQuestions(User user, QuestionType type) {
        try {
            repository.resetAllDatesForUserAndType(user, type);
        } catch (Exception e) {
            logger.error("Error resetting questions: {}", e.getMessage());
            throw new RuntimeException("Failed to reset questions", e);
        }
    }

    // Resets a specific question (marks it as unanswered)
    public void resetQuestionDate(String question, User user, QuestionType type) {
        Question questionEntity = repository.findByQuestionAndUserAndType(question, user, type);
        if (questionEntity != null) {
            questionEntity.setUpdatedAt(null);
            repository.save(questionEntity);
        } else {
            throw new RuntimeException("Question not found");
        }
    }

    // Creates a new question for the user
    public Question addQuestion(Question question, User user, QuestionType type) {
        question.setUpdatedAt(null);
        question.setUser(user);
        question.setType(type);
        return repository.save(question);
    }

    // Deletes a question after security checks
    public void deleteQuestion(Long id, User user, QuestionType type) {
        Question question = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        // Security check: ensure the question belongs to the requesting user
        if (!question.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Question does not belong to current user");
        }

        if (type != question.getType()) {
            throw new RuntimeException("Access denied: Question type does not match");
        }

        repository.delete(question);
    }

    // Gets all questions for a specific user and type
    public List<Question> getQuestionsByUser(User user, QuestionType type) {
        return repository.findByUserAndType(user, type);
    }
} 