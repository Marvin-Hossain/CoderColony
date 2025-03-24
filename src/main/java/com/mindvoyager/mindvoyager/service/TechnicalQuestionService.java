package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import com.mindvoyager.mindvoyager.repository.TechnicalQuestionRepository;
import com.mindvoyager.mindvoyager.model.User;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TechnicalQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(TechnicalQuestionService.class);

    private final TechnicalQuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    // Constructor injection
    public TechnicalQuestionService(
            TechnicalQuestionRepository repository,
            OpenAIService openAIService) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = new ObjectMapper();
    }

    public TechnicalQuestion getRandomQuestion(User user) {
        try {
            TechnicalQuestion question = repository.findRandomQuestionForUser(user.getId());
            if (question == null) {
                // Return a special TechnicalQuestion indicating no more questions
                TechnicalQuestion noMoreQuestions = new TechnicalQuestion();
                noMoreQuestions.setQuestion("No more questions for today! Please reset or come back tomorrow!");
                return noMoreQuestions;
            }
            return question;
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new RuntimeException("Failed to get random question", e);
        }
    }

    private static final String EVALUATION_PROMPT_TEMPLATE = 
    "You are a software engineer interview coach. Evaluate this technical interview response.\n" +
    "Question: '%s'\n" +
    "Response: '%s'\n\n" +
    "Provide detailed feedback and a rating. Return your response in this JSON format:\n" +
    "{\n" +
    "  \"rating\": <number between 1-10>,\n" +
    "  \"feedback\": \"<detailed feedback with specific improvements>\"\n" +
    "}";

    public TechnicalQuestion evaluateResponse(String question, String response, User user) {
        try {
            TechnicalQuestion technicalQuestion = repository.findByQuestionAndUser(question, user);
            if (technicalQuestion == null) {
                throw new RuntimeException("No existing question found to update.");
            }

            String prompt = String.format(EVALUATION_PROMPT_TEMPLATE, question, response);
            String gptResponse = openAIService.getResponse(response, prompt);
            JsonNode jsonResponse = objectMapper.readTree(gptResponse);
            
            updateTechnicalQuestion(technicalQuestion, response, jsonResponse);
            return repository.save(technicalQuestion);
        } catch (Exception e) {
            logger.error("Error evaluating response", e);
            throw new RuntimeException("Failed to evaluate response", e);
        }
    }

    private void updateTechnicalQuestion(TechnicalQuestion question, String response, JsonNode evaluation) {
        question.setResponseText(response);
        question.setCreatedAt(LocalDate.now());
        question.setRating(evaluation.get("rating").asInt());
        question.setFeedback(evaluation.get("feedback").asText());
    }

    public long getTodayCount(User user) {
        return repository.countByDateAndUser(LocalDate.now(), user);
    }

    @Transactional
    public void resetAllQuestions(User user) {
        try {
            repository.resetAllDatesForUser(user);
        } catch (Exception e) {
            logger.error("Error resetting questions: {}", e.getMessage());
            throw new RuntimeException("Failed to reset questions", e);
        }
    }

    public void resetQuestionDate(String question, User user) {
        TechnicalQuestion technicalQuestion = repository.findByQuestionAndUser(question, user);
        if (technicalQuestion != null) {
            technicalQuestion.setCreatedAt(null);
            repository.save(technicalQuestion);
        } else {
            throw new RuntimeException("Question not found for this user");
        }
    }

    public List<TechnicalQuestion> getAllQuestions() {
        return repository.findAll();
    }
    
    public TechnicalQuestion addQuestion(TechnicalQuestion question, User user) {
        question.setCreatedAt(null);
        question.setUser(user);
        return repository.save(question);
    }

    public void deleteQuestion(Long id, User user) {
        TechnicalQuestion question = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        // Security check: ensure the question belongs to the requesting user
        if (!question.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Question does not belong to current user");
        }
        
        repository.delete(question);
    }

    public List<TechnicalQuestion> getQuestionsByUser(User user) {
        return repository.findByUser(user);
    }
} 