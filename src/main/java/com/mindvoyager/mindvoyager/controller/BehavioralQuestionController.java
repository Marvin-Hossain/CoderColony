package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.service.BehavioralQuestionService;
import com.mindvoyager.mindvoyager.service.ProgressService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/behavioral")
@CrossOrigin(origins = "http://localhost:3000")
public class BehavioralQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionController.class);

    @Autowired
    private BehavioralQuestionService service;

    @Autowired
    private ProgressService progressService;

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
    public ResponseEntity<BehavioralQuestion> evaluateResponse(@RequestBody Map<String, String> request) {
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
            
            BehavioralQuestion result = service.evaluateResponse(question, response, isNewQuestion);
            logger.info("Evaluation complete - Rating: {}", result.getRating());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating response: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(new BehavioralQuestion());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTodayCount() {
        return ResponseEntity.ok(Map.of("count", service.getTodayCount()));
    }

    @PostMapping("/complete")
    public ResponseEntity<Void> completeQuestion() {
        progressService.logProgress("behavioral", 1);
        return ResponseEntity.ok().build();
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