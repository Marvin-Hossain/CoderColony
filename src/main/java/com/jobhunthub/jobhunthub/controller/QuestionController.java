package com.jobhunthub.jobhunthub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.EvaluateResponseRequest;
import com.jobhunthub.jobhunthub.dto.QuestionDTO;
import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.QuestionService;



/**
 * REST Controller for handling interview questions.
 * Provides endpoints for both behavioral and technical questions.
 */
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService service;

    public QuestionController(QuestionService service) {
        this.service = service;
    }

    // CRUD Endpoints

    // Add a new question for the user
    @PostMapping("/{type}/add")
    public ResponseEntity<Question> addQuestion(@PathVariable String type, @RequestBody Question question, @AuthenticationPrincipal UserPrincipal me) {
        User currentUser = me.getDomainUser();
        Question savedQuestion = service.addQuestion(question, currentUser, Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
    }

    // Get all questions of a specific type
    @GetMapping("/{type}/all")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions(@PathVariable String type, @AuthenticationPrincipal UserPrincipal me) {
        List<QuestionDTO> questionDTOs = service.getQuestionsByUser(me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok(questionDTOs);
    }

    // Delete a question after security checks
    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String type, @PathVariable Long id, @AuthenticationPrincipal UserPrincipal me) {
        service.deleteQuestion(id, me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.noContent().build();
    }

    // QUERY Endpoints

    // Get a random unanswered question for the user
    @GetMapping("/{type}/question")
    public ResponseEntity<Question> getRandomQuestion(@PathVariable String type, @AuthenticationPrincipal UserPrincipal me) {
        Question question = service.getRandomQuestion(me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok(question);
    }

    // STATS Endpoints

    // Get count of successfully answered questions for today
    @GetMapping("/{type}/count")
    public ResponseEntity<Map<String, Long>> getTodayCount(@PathVariable String type, @AuthenticationPrincipal UserPrincipal me) {
        long count = service.getTodayCount(me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ACTIONS Endpoints

    // Submit user's response for AI evaluation
    @PostMapping("/{type}/evaluate")
    public ResponseEntity<Question> evaluateResponse(@PathVariable String type, @RequestBody EvaluateResponseRequest request, @AuthenticationPrincipal UserPrincipal me) {
        if (!request.isValid()) {
            return ResponseEntity.badRequest().build();
        }
        Question result = service.evaluateResponse(request.getQuestion(), request.getResponse(), me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok(result);
    }

    // Reset all questions of specific type for user (marks them as unanswered)
    @PostMapping("/{type}/reset")
    public ResponseEntity<Void> resetQuestions(@PathVariable String type, @AuthenticationPrincipal UserPrincipal me) {
        service.resetAllQuestions(me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok().build();
    }

    // Reset a specific question (marks it as unanswered)
    @PostMapping("/{type}/reset-date")
    public ResponseEntity<Void> resetQuestionDate(@PathVariable String type, @RequestBody Map<String, String> request, @AuthenticationPrincipal UserPrincipal me) {
        service.resetQuestionDate(request.get("question"), me.getDomainUser(), Question.QuestionType.valueOf(type.toUpperCase()));
        return ResponseEntity.ok().build();
    }
}
