package com.jobhunthub.jobhunthub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Builder
@Table(name = "jobs")
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String company;
    private String location;

    @Enumerated(EnumType.STRING)
    private Status status; // APPLIED, REJECTED, INTERVIEWED

    @Column(name = "created_at")
    private LocalDate createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Enum for Status
    public enum Status {
        APPLIED,
        REJECTED,
        INTERVIEWED
    }
}
