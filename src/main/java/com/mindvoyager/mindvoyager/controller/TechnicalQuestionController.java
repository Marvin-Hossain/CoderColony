package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.TechnicalQuestion;
import com.mindvoyager.mindvoyager.service.TechnicalQuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mindvoyager.mindvoyager.dto.EvaluateResponseRequest;

import java.util.Map;
import java.util.List;

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
    public ResponseEntity<TechnicalQuestion> evaluateResponse(@RequestBody EvaluateResponseRequest request) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            
            TechnicalQuestion result = service.evaluateResponse(
                request.getQuestion(), 
                request.getResponse()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating response: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTodayCount() {
        return ResponseEntity.ok(Map.of("count", service.getTodayCount()));
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetQuestions() {
        try {
            service.resetAllQuestions(); // Call the service method to reset questions
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting questions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset-date")
    public ResponseEntity<Void> resetQuestionDate(@RequestBody Map<String, String> request) {
        try {
            String question = request.get("question");
            service.resetQuestionDate(question); // Call the service method to reset the date
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting question date: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // // Optional: If you want to add a complete question endpoint similar to Behavioral
    // @PostMapping("/complete")
    // public ResponseEntity<Void> completeQuestion() {
    //     progressService.logProgress("technical", 1);
    //     return ResponseEntity.ok().build();
    // }

    @GetMapping("/all")
public ResponseEntity<List<TechnicalQuestion>> getAllQuestions() {
    try {
        List<TechnicalQuestion> questions = service.getAllQuestions();
        return ResponseEntity.ok(questions);
    } catch (Exception e) {
        logger.error("Error fetching all questions: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

@PostMapping("/add")
public ResponseEntity<TechnicalQuestion> addQuestion(@RequestBody TechnicalQuestion question) {
    try {
        TechnicalQuestion savedQuestion = service.addQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
    } catch (Exception e) {
        logger.error("Error adding question: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
    try {
        service.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    } catch (Exception e) {
        logger.error("Error deleting question: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
} 