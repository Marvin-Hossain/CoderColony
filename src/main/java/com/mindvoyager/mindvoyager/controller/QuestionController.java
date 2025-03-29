package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.model.Question;
import com.mindvoyager.mindvoyager.service.QuestionService;
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
import java.util.Optional;
// OAuth2 specific imports
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * REST Controller for handling interview questions.
 * Provides endpoints for both behavioral and technical questions.
 */
@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {
    private static final Logger logger = LoggerFactory.getLogger(QuestionController.class);

    private final QuestionService service;
    private final UserService userService;

    // Constructor injection
    public QuestionController(QuestionService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    // Gets current user from authentication
    private User getCurrentUser(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            throw new RuntimeException("User not authenticated");
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String githubId = oAuth2User.getAttribute("id").toString();

        Optional<User> userOptional = userService.findByGithubId(githubId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        return userOptional.get();
    }

    // Retrieves a random unanswered question for the user
    @GetMapping("/{type}/question")
    public ResponseEntity<Question> getRandomQuestion(
            @PathVariable String type,
            Authentication authentication) {
        logger.info("Received request for {} question", type);
        try {
            User currentUser = getCurrentUser(authentication);
            Question question = service.getRandomQuestion(currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            logger.error("Error getting random question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Submits user's response for AI evaluation
    @PostMapping("/{type}/evaluate")
    public ResponseEntity<Question> evaluateResponse(
            @PathVariable String type,
            @RequestBody EvaluateResponseRequest request,
            Authentication authentication) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.badRequest().build();
            }

            User currentUser = getCurrentUser(authentication);
            Question result = service.evaluateResponse(
                    request.getQuestion(),
                    request.getResponse(),
                    currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase())
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error evaluating response: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Gets count of successfully answered questions for today
    @GetMapping("/{type}/count")
    public ResponseEntity<Map<String, Long>> getTodayCount(
            @PathVariable String type,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            long count = service.getTodayCount(currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            logger.error("Error getting today's count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Resets all questions of specific type for user (marks them as unanswered)
    @PostMapping("/{type}/reset")
    public ResponseEntity<Void> resetQuestions(
            @PathVariable String type,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            service.resetAllQuestions(currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting questions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Resets a specific question (marks it as unanswered)
    @PostMapping("/{type}/reset-date")
    public ResponseEntity<Void> resetQuestionDate(
            @PathVariable String type,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            String question = request.get("question");
            service.resetQuestionDate(question, currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error resetting question date: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Adds a new question for the user
    @PostMapping("/{type}/add")
    public ResponseEntity<Question> addQuestion(
            @PathVariable String type,
            @RequestBody Question question,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            Question savedQuestion = service.addQuestion(question, currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
        } catch (Exception e) {
            logger.error("Error adding question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Gets all questions of a specific type
    @GetMapping("/{type}/all")
    public ResponseEntity<List<Question>> getAllQuestions(
            @PathVariable String type,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            List<Question> questions = service.getQuestionsByUser(currentUser,
                    Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            logger.error("Error fetching all questions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Deletes a question after security checks
    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable String type,
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            service.deleteQuestion(id, currentUser, Question.QuestionType.valueOf(type.toUpperCase()));
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting question: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
