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
import com.mindvoyager.mindvoyager.model.User;

@Service
public class BehavioralQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionService.class);

    private final BehavioralQuestionRepository repository;
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    // Constructor injection
    public BehavioralQuestionService(
            BehavioralQuestionRepository repository, 
            OpenAIService openAIService) {
        this.repository = repository;
        this.openAIService = openAIService;
        this.objectMapper = new ObjectMapper();
    }

    public BehavioralQuestion getRandomQuestion(User user) {
        try {
            BehavioralQuestion question = repository.findRandomQuestionForUser(user.getId());
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

                public BehavioralQuestion evaluateResponse(String question, String response, User user) {
                    try {
                        BehavioralQuestion behavioralQuestion = repository.findByQuestionAndUser(question, user);
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
                    int rating = evaluation.get("rating").asInt();
                    question.setRating(evaluation.get("rating").asInt());
                    question.setFeedback(evaluation.get("feedback").asText());
                            // Only set createdAt if rating is greater than 5
                    if (rating > 5) {
                        question.setCreatedAt(LocalDate.now());
                    } else {
                        question.setCreatedAt(null); // Reset date if rating is too low
                    }
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
                    // Assuming you have a method in the repository to find the question by its text
                    BehavioralQuestion behavioralQuestion = repository.findByQuestionAndUser(question, user);
                    if (behavioralQuestion != null) {
                        behavioralQuestion.setCreatedAt(null); // Reset the date to null
                        repository.save(behavioralQuestion); // Save the updated question
                    } else {
                        throw new RuntimeException("Question not found");
                    }
                }

    public BehavioralQuestion addQuestion(BehavioralQuestion question, User user) {
        question.setCreatedAt(null); // Set the creation date
        question.setUser(user);
        return repository.save(question); // Save the question to the database
    }

    public List<BehavioralQuestion> getAllQuestions() {
        return repository.findAll();
    }

    public void deleteQuestion(Long id, User user) {
        BehavioralQuestion question = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        // Security check: ensure the question belongs to the requesting user
        if (!question.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Question does not belong to current user");
        }

        repository.delete(question);
    }

    public List<BehavioralQuestion> getQuestionsByUser(User user) {
        return repository.findByUser(user);
    }
} 