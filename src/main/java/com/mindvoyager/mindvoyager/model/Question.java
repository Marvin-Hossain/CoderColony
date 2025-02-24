package com.mindvoyager.mindvoyager.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_type")
    private String questionType;

    @Column(length = 500)
    private String question;

    @Column(name = "input_text", length = 2000)
    private String inputText;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @Column
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getInputText() { return inputText; }
    public void setInputText(String inputText) { this.inputText = inputText; }

    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

} 