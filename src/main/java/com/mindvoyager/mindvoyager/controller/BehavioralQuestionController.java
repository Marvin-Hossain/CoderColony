package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.service.BehavioralQuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mindvoyager.mindvoyager.dto.EvaluateResponseRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/behavioral")
@CrossOrigin(origins = "http://localhost:3000")
public class BehavioralQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionController.class);

    private final BehavioralQuestionService service;

    public BehavioralQuestionController(BehavioralQuestionService service) {
        this.service = service;
    }

    @GetMapping("/question")
    public ResponseEntity<BehavioralQuestion> getRandomQuestion() {
        try {
            BehavioralQuestion question = service.getRandomQuestion();
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<BehavioralQuestion> evaluateResponse(@RequestBody EvaluateResponseRequest request) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            
            BehavioralQuestion result = service.evaluateResponse(
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

    @PostMapping("/add")
    public ResponseEntity<BehavioralQuestion> addQuestion(@RequestBody BehavioralQuestion question) {
        try {
            BehavioralQuestion savedQuestion = service.addQuestion(question);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
        } catch (Exception e) {
            logger.error("Error adding question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BehavioralQuestion>> getAllQuestions() {
        try {
            List<BehavioralQuestion> questions = service.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            logger.error("Error fetching all questions: ", e);
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