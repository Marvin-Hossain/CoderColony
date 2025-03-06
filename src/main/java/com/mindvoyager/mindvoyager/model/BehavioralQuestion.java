package com.mindvoyager.mindvoyager.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "behavioral_questions")
public class BehavioralQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String question;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "response_text", length = 2000)
    private String responseText;

    @Column
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public String getResponseText() { return responseText; }
    public void setResponseText(String responseText) { this.responseText = responseText; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // @PrePersist
    // protected void onCreate() {
    //     createdAt = LocalDate.now();
    // }
} 