package com.jobhunthub.jobhunthub.model;

import jakarta.persistence.*;
import lombok.*;


@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String githubId;

    private String username;

    private String email;

    private String avatarUrl;

}
