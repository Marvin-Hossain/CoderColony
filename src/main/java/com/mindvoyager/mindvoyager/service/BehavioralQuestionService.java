package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.repository.BehavioralQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@Service
public class BehavioralQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionService.class);

    @Autowired
    private BehavioralQuestionRepository repository;

    @Autowired
    private OpenAIService openAIService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public BehavioralQuestion getRandomQuestion() {
        try {
            BehavioralQuestion question = repository.findRandomQuestion();
            if (question == null) {
                throw new RuntimeException("No questions available in the database");
            }
            return question;
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new RuntimeException("Failed to get random question", e);
        }
    }

    public BehavioralQuestion evaluateResponse(String question, String response, boolean isNewQuestion) {
        System.out.println("BehavioralQuestionService - Starting evaluation");
        
        try {
            List<BehavioralQuestion> existingResponses = 
                repository.findAllByQuestionAndDate(question, LocalDate.now());
            
            BehavioralQuestion behavioralQuestion;
            if (!existingResponses.isEmpty()) {
                behavioralQuestion = existingResponses.get(0);
            } else {
                behavioralQuestion = new BehavioralQuestion();
                behavioralQuestion.setQuestion(question);
                behavioralQuestion.setCreatedAt(LocalDate.now());
            }
            
            behavioralQuestion.setResponseText(response);

            // Individual AI prompt for behavioral questions
            String prompt = String.format(
                "You are an experienced technical interview coach specializing in behavioral questions. " +
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
                "}",
                question, response
            );

            // Use the individual prompt
            String gptResponse = openAIService.getResponse(response, prompt); // Pass the prompt here
            JsonNode jsonResponse = objectMapper.readTree(gptResponse);

            behavioralQuestion.setRating(jsonResponse.get("rating").asInt());
            behavioralQuestion.setFeedback(jsonResponse.get("feedback").asText());
            
            return repository.save(behavioralQuestion);
        } catch (Exception e) {
            logger.error("Error evaluating response: ", e);
            BehavioralQuestion fallback = new BehavioralQuestion();
            fallback.setQuestion(question);
            fallback.setResponseText(response);
            fallback.setRating(5);
            fallback.setFeedback("An error occurred while evaluating your response. Please try again.");
            fallback.setCreatedAt(LocalDate.now());
            return fallback;
        }
    }

    public long getTodayCount() {
        return repository.countByDate(LocalDate.now());
    }

    public BehavioralQuestion addQuestion(BehavioralQuestion question) {
        question.setCreatedAt(LocalDate.now()); // Set the creation date
        return repository.save(question); // Save the question to the database
    }

    public List<BehavioralQuestion> getAllQuestions() {
        return repository.findAll();
    }

    public void deleteQuestion(Long id) {
        repository.deleteById(id);
    }
} 