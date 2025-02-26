package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import com.mindvoyager.mindvoyager.repository.TechnicalQuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private TechnicalQuestionRepository repository;

    @Autowired
    private OpenAIService openAIService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public TechnicalQuestion getRandomQuestion() {
        try {
            TechnicalQuestion question = repository.findRandomQuestion();
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

    public TechnicalQuestion evaluateResponse(String question, String response) {
        try {
            TechnicalQuestion technicalQuestion = repository.findByQuestion(question);
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

    public long getTodayCount() {
        return repository.countByDate(LocalDate.now());
    }

    @Transactional
    public void resetAllQuestions() {
        try {
            repository.resetAllDates();
        } catch (Exception e) {
            logger.error("Error resetting questions: {}", e.getMessage());
            throw new RuntimeException("Failed to reset questions", e);
        }
    }

    public void resetQuestionDate(String question) {
        // Assuming you have a method in the repository to find the question by its text
        TechnicalQuestion technicalQuestion = repository.findByQuestion(question);
        if (technicalQuestion != null) {
            technicalQuestion.setCreatedAt(null); // Reset the date to null
            repository.save(technicalQuestion); // Save the updated question
        } else {
            throw new RuntimeException("Question not found");
        }
    }

    public List<TechnicalQuestion> getAllQuestions() {
        return repository.findAll();
    }
    
    public TechnicalQuestion addQuestion(TechnicalQuestion question) {
        question.setCreatedAt(null);
        return repository.save(question);
    }

    public void deleteQuestion(Long id) {
        repository.deleteById(id);
    }
} 