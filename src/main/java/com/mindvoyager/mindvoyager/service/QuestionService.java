package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.Question;
import com.mindvoyager.mindvoyager.repository.QuestionRepository;
import com.mindvoyager.mindvoyager.model.Question.QuestionType;
import com.mindvoyager.mindvoyager.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.mindvoyager.mindvoyager.exception.GlobalExceptionHandler.AuthenticationException;
import com.mindvoyager.mindvoyager.exception.GlobalExceptionHandler.InvalidRequestException;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.time.ZoneId;

import com.mindvoyager.mindvoyager.model.User;

@Service
public class QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    private final QuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;
    private final ZoneId zoneId;

    // Constructor injection
    public QuestionService(
            QuestionRepository repository,
            OpenAIService openAIService,
            ZoneId zoneId) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = new ObjectMapper();
        this.zoneId = zoneId;
    }

    // Get an unanswered question randomly
    public Question getRandomQuestion(User user, QuestionType type) {
        try {
            Question question = repository.findRandomQuestionForUserAndType(user.getId(), type.toString());
            if (question == null) {
                return createNoMoreQuestionsResponse();
            }
            return question;
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new InvalidRequestException("Failed to get random question: " + e.getMessage());
        }
    }

    private static final String TECHNICAL_EVALUATION_PROMPT_TEMPLATE =
            """
                    You are an experienced technical interview coach specializing in technical questions. \
                    Evaluate responses based on:
                    1. Technical accuracy and understanding
                    2. Problem-solving approach
                    3. Code quality and best practices (if code is involved)
                    4. Communication of technical concepts
                    
                    Question: '%s'
                    Response: '%s'
                    
                    Provide feedback in this JSON format:
                    {
                      "rating": <number 1-10>,
                      "feedback": "<Start with technical strengths, then areas for improvement, and end with actionable tips.>"
                    }""";

    private static final String BEHAVIORAL_EVALUATION_PROMPT_TEMPLATE =
            """
                               You are an experienced technical interview coach specializing in behavioral questions. \
                    Evaluate responses using the STAR method (Situation, Task, Action, Result). \
                    Be constructive but firm in your feedback. \
                    For each response, analyze:
                    1. Structure and completeness
                    2. Specific examples and details
                    3. Professional impact and results
                    4. Communication clarity
                    
                    Question: '%s'
                    Response: '%s'
                    
                    Provide feedback in this JSON format:
                    {
                      "rating": <number 1-10>,
                      "feedback": "<Start with strengths, then areas for improvement, and end with actionable tips.>"
                    }""";

    // Send response to GPT-4 for evaluation
    public Question evaluateResponse(String question, String response, User user, QuestionType type) {
        try {
            Question questionEntity = repository.findByQuestionAndUserAndType(question, user, type);
            if (questionEntity == null) {
                throw new ResourceNotFoundException("Question", "text", question);
            }

            // Use different prompts for behavioral vs technical
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
            throw new InvalidRequestException("Failed to evaluate response: " + e.getMessage());
        }
    }

    // Mark question as completed if rating > 5
    private void updateQuestion(Question question, String response, JsonNode evaluation) {
        question.setResponseText(response);
        int rating = evaluation.get("rating").asInt();
        question.setRating(rating);
        question.setFeedback(evaluation.get("feedback").asText());

        question.setUpdatedAt(rating > 5 ? LocalDate.now(zoneId) : null);
    }

    // Gets count of successfully answered questions for today
    public long getTodayCount(User user, QuestionType type) {
        return repository.countByDateAndUserAndType(LocalDate.now(zoneId), user, type);
    }

    // Resets all questions of specific type for user (marks them as unanswered)
    @Transactional
    public void resetAllQuestions(User user, QuestionType type) {
        try {
            repository.resetAllDatesForUserAndType(user, type);
        } catch (Exception e) {
            logger.error("Error resetting questions: {}", e.getMessage());
            throw new InvalidRequestException("Failed to reset questions: " + e.getMessage());
        }
    }

    // Resets a specific question (marks it as unanswered)
    public void resetQuestionDate(String question, User user, QuestionType type) {
        Question questionEntity = repository.findByQuestionAndUserAndType(question, user, type);
        if (questionEntity == null) {
            throw new ResourceNotFoundException("Question", "text", question);
        }
        questionEntity.setUpdatedAt(null);
        repository.save(questionEntity);
    }

    // Creates a new question for the user
    public Question addQuestion(Question question, User user, QuestionType type) {
        if (question == null || question.getQuestion() == null || question.getQuestion().trim().isEmpty()) {
            throw new InvalidRequestException("Question text cannot be empty");
        }
        question.setUpdatedAt(null);
        question.setUser(user);
        question.setType(type);
        return repository.save(question);
    }

    // Deletes a question after security checks
    public void deleteQuestion(Long id, User user, QuestionType type) {
        Question question = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));

        // Security check: ensure the question belongs to the requesting user
        if (!question.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("Not authorized to delete this question");
        }

        if (type != question.getType()) {
            throw new InvalidRequestException("Question type does not match");
        }

        repository.delete(question);
    }

    // Gets all questions for a specific user and type
    public List<Question> getQuestionsByUser(User user, QuestionType type) {
        List<Question> questions = repository.findByUserAndType(user, type);
        if (questions.isEmpty()) {
            throw new ResourceNotFoundException("No questions found for user and type");
        }
        return questions;
    }

    private Question createNoMoreQuestionsResponse() {
        Question noMoreQuestions = new Question();
        noMoreQuestions.setQuestion("No more questions for today! Please reset or come back tomorrow!");
        return noMoreQuestions;
    }
} 