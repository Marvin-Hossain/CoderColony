package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.BehavioralQuestion;
import com.mindvoyager.mindvoyager.service.BehavioralQuestionService;
import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mindvoyager.mindvoyager.dto.EvaluateResponseRequest;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Optional;


@RestController
@RequestMapping("/api/behavioral")
@CrossOrigin(origins = "http://localhost:3000")
public class BehavioralQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(BehavioralQuestionController.class);

    private final BehavioralQuestionService service;
    private final UserService userService;

    public BehavioralQuestionController(BehavioralQuestionService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    // Helper method to get current user
    private User getCurrentUser(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            throw new RuntimeException("User not authenticated");
        }
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String githubId = oAuth2User.getAttribute("id").toString();
        
        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        return userOptional.get();
    }
    

    @GetMapping("/question")
    public ResponseEntity<BehavioralQuestion> getRandomQuestion(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            BehavioralQuestion question = service.getRandomQuestion(currentUser);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<BehavioralQuestion> evaluateResponse(
            @RequestBody EvaluateResponseRequest request,
            Authentication authentication) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }
            
            User currentUser = getCurrentUser(authentication);
            BehavioralQuestion result = service.evaluateResponse(
                request.getQuestion(), 
                request.getResponse(),
                currentUser
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating response: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //check method to match technical (may help grab count)
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTodayCount(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            long count = service.getTodayCount(currentUser);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            logger.error("Error getting today's count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetQuestions(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            service.resetAllQuestions(currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting questions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset-date")
    public ResponseEntity<Void> resetQuestionDate(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            String question = request.get("question");
            service.resetQuestionDate(question, currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting question date: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<BehavioralQuestion> addQuestion(
            @RequestBody BehavioralQuestion question,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            BehavioralQuestion savedQuestion = service.addQuestion(question, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
        } catch (Exception e) {
            logger.error("Error adding question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<BehavioralQuestion>> getAllQuestions(Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            List<BehavioralQuestion> questions = service.getQuestionsByUser(currentUser);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            logger.error("Error fetching all questions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            service.deleteQuestion(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 