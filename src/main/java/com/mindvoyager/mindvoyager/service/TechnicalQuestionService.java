package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import com.mindvoyager.mindvoyager.repository.TechnicalQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
                throw new RuntimeException("No questions available in the database");
            }
            return question;
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            throw new RuntimeException("Failed to get random question", e);
        }
    }

    public TechnicalQuestion evaluateResponse(String question, String response, boolean isNewQuestion) {
        try {
            List<TechnicalQuestion> existingResponses = 
                repository.findAllByQuestionAndDate(question, LocalDate.now());
            
            TechnicalQuestion technicalQuestion;
            if (!existingResponses.isEmpty()) {
                technicalQuestion = existingResponses.get(0);
            } else {
                technicalQuestion = new TechnicalQuestion();
                technicalQuestion.setQuestion(question);
                technicalQuestion.setCreatedAt(LocalDate.now());
            }
            
            technicalQuestion.setResponseText(response);

            // Individual AI prompt for technical questions
            String prompt = String.format(
                "You are a software engineer interview coach. Evaluate this technical interview response.\n" +
                "Question: '%s'\n" +
                "Response: '%s'\n\n" +
                "Provide detailed feedback and a rating. Return your response in this JSON format:\n" +
                "{\n" +
                "  \"rating\": <number between 1-10>,\n" +
                "  \"feedback\": \"<detailed feedback with specific improvements>\"\n" +
                "}",
                question, response
            );

            String gptResponse = openAIService.getResponse(response, prompt); // Pass the prompt here
            JsonNode jsonResponse = objectMapper.readTree(gptResponse);

            technicalQuestion.setRating(jsonResponse.get("rating").asInt());
            technicalQuestion.setFeedback(jsonResponse.get("feedback").asText());
            
            return repository.save(technicalQuestion);
        } catch (Exception e) {
            logger.error("Error evaluating response: ", e);
            TechnicalQuestion fallback = new TechnicalQuestion();
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
} 