package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import com.mindvoyager.mindvoyager.service.TechnicalQuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/technical")
@CrossOrigin(origins = "http://localhost:3000")
public class TechnicalQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(TechnicalQuestionController.class);

    @Autowired
    private TechnicalQuestionService service;

    @GetMapping("/question")
    public ResponseEntity<TechnicalQuestion> getRandomQuestion() {
        try {
            TechnicalQuestion question = service.getRandomQuestion();
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<TechnicalQuestion> evaluateResponse(@RequestBody Map<String, String> request) {
        try {
            String question = request.get("question");
            String response = request.get("response");
            boolean isNewQuestion = Boolean.parseBoolean(request.get("isNewQuestion"));
            
            logger.info("Received evaluation request - Question: {}, Response length: {}, New Question: {}", 
                       question, 
                       response != null ? response.length() : 0,
                       isNewQuestion);
            
            if (question == null || response == null) {
                logger.error("Missing question or response in request");
                return ResponseEntity.badRequest().build();
            }
            
            TechnicalQuestion result = service.evaluateResponse(question, response, isNewQuestion);
            logger.info("Evaluation complete - Rating: {}", result.getRating());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating response: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(new TechnicalQuestion());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTodayCount() {
        return ResponseEntity.ok(Map.of("count", service.getTodayCount()));
    }

    // Optional: If you want to add a complete question endpoint similar to Behavioral
    // @PostMapping("/complete")
    // public ResponseEntity<Void> completeQuestion() {
    //     progressService.logProgress("technical", 1);
    //     return ResponseEntity.ok().build();
    // }
} 