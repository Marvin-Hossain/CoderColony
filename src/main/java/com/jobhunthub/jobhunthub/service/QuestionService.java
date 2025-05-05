package com.jobhunthub.jobhunthub.service;

import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.repository.QuestionRepository;
import com.jobhunthub.jobhunthub.model.Question.QuestionType;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.*;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.time.ZoneId;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.dto.QuestionDTO;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    private final QuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;
    private final ZoneId zoneId;

    // Constructor injection
    public QuestionService(QuestionRepository repository, OpenAIService openAIService, ZoneId zoneId) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = new ObjectMapper();
        this.zoneId = zoneId;
    }

    // Get an unanswered question randomly
    public Question getRandomQuestion(User user, QuestionType type) {
        try {
            Question question = repository.findRandomQuestionForUserAndType(user.getId(), type.toString());
            return question != null ? question : createNoMoreQuestionsResponse();
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new InvalidRequestException("Failed to get random question: " + e.getMessage());
        }
    }

    // GPT prompt templates for different question types
    private static final String TECHNICAL_EVALUATION_PROMPT_TEMPLATE =
            """
            You are an experienced technical interview coach specializing in technical questions. \
            Evaluate responses based on:
            1. Technical accuracy and understanding
            2. Problem-solving approach
            3. Code quality and best practices (if code is involved)
            4. Communication of technical concepts

            Important Notes:
            - This is a voice-to-text input, so IGNORE:
                * Grammatical errors
                * Punctuation issues
                * Sentence fragments
                * Unnecessary pauses
                * Filler words (um, uh, like, you know)
            - Focus ONLY on:
                * STAR method implementation
                * Content relevance
                * Specific examples provided
                * Professional achievements
            * Overall story structure
            
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

            Important Notes:
            - This is a voice-to-text input, so IGNORE:
                * Grammatical errors
                * Punctuation issues
                * Sentence fragments
                * Unnecessary pauses
                * Filler words (um, uh, like, you know)
            - Focus ONLY on:
                * STAR method implementation
                * Content relevance
                * Specific examples provided
                * Professional achievements
            * Overall story structure
            
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

            validateQuestionOwnership(questionEntity, user, type);

            String prompt = type == QuestionType.BEHAVIORAL ? 
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
        validateQuestionOwnership(questionEntity, user, type);
        questionEntity.setUpdatedAt(null);
        repository.save(questionEntity);
    }

    // Creates a new question for the user
    public Question addQuestion(Question question, User user, QuestionType type) {
        validateNewQuestion(question);
        
        // Check for duplicate question
        if (repository.findByQuestionAndUserAndType(question.getQuestion(), user, type) != null) {
            throw new InvalidRequestException("This question already exists for your account");
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
        validateQuestionOwnership(question, user, type);
        repository.delete(question);
    }

    // Gets all questions for a specific user and type
    public List<QuestionDTO> getQuestionsByUser(User user, QuestionType type) {
        List<Question> questions = repository.findByUserAndType(user, type);
        if (questions.isEmpty()) {
            throw new ResourceNotFoundException("No questions found for user and type");
        }
        return questions.stream()
                .map(QuestionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Security validation methods
    private void validateQuestionOwnership(Question question, User user, QuestionType type) {
        if (!question.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("Not authorized to access this question");
        }
        if (type != question.getType()) {
            throw new InvalidRequestException("Question type does not match");
        }
    }

    private void validateNewQuestion(Question question) {
        if (question == null || question.getQuestion() == null || 
            question.getQuestion().trim().isEmpty()) {
            throw new InvalidRequestException("Question text cannot be empty");
        }
    }

    // Mark question as completed if rating > 6
    private void updateQuestion(Question question, String response, JsonNode evaluation) {
        question.setResponseText(response);
        int rating = evaluation.get("rating").asInt();
        question.setRating(rating);
        question.setFeedback(evaluation.get("feedback").asText());
        question.setUpdatedAt(rating > 6 ? LocalDate.now(zoneId) : null);
    }

    private Question createNoMoreQuestionsResponse() {
        Question noMoreQuestions = new Question();
        noMoreQuestions.setQuestion("No more questions for today! Please reset or come back tomorrow!");
        return noMoreQuestions;
    }
} 