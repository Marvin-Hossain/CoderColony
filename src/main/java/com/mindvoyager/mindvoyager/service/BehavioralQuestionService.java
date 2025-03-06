package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.repository.BehavioralQuestionRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class BehavioralQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionService.class);

    private final BehavioralQuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    // Constructor injection
    public BehavioralQuestionService(
            BehavioralQuestionRepository repository, 
            OpenAIService openAIService,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = objectMapper;
    }

    public BehavioralQuestion getRandomQuestion() {
        try {
            BehavioralQuestion question = repository.findRandomQuestion();
            if (question == null) {
                // Return a special TechnicalQuestion indicating no more questions
                BehavioralQuestion noMoreQuestions = new BehavioralQuestion();
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

                public BehavioralQuestion evaluateResponse(String question, String response) {
                    try {
                        BehavioralQuestion behavioralQuestion = repository.findByQuestion(question);
                        if (behavioralQuestion == null) {
                            throw new RuntimeException("No existing question found to update.");
                        }
            
                        String prompt = String.format(EVALUATION_PROMPT_TEMPLATE, question, response);
                        String gptResponse = openAIService.getResponse(response, prompt);
                        JsonNode jsonResponse = objectMapper.readTree(gptResponse);
                        
                        updateBehavioralQuestion(behavioralQuestion, response, jsonResponse);
                        return repository.save(behavioralQuestion);
                    } catch (Exception e) {
                        logger.error("Error evaluating response", e);
                        throw new RuntimeException("Failed to evaluate response", e);
                    }
                }
            
                private void updateBehavioralQuestion(BehavioralQuestion question, String response, JsonNode evaluation) {
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
                    BehavioralQuestion behavioralQuestion = repository.findByQuestion(question);
                    if (behavioralQuestion != null) {
                        behavioralQuestion.setCreatedAt(null); // Reset the date to null
                        repository.save(behavioralQuestion); // Save the updated question
                    } else {
                        throw new RuntimeException("Question not found");
                    }
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