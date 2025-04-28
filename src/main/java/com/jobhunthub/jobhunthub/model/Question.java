package com.jobhunthub.jobhunthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "questions")
public class Question {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private QuestionType type;  // BEHAVIORAL, TECHNICAL

    @Column(length = 500)
    private String question;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @Column(name = "response_text", length = 2000)
    private String responseText;

    @Column
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public enum QuestionType {
        BEHAVIORAL,
        TECHNICAL
    }
} 