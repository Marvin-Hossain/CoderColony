package com.jobhunthub.jobhunthub.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateProfileRequestDTO {
    // Getters and setters
    private String username;
    private String primaryEmail;
    private String avatarUrl;

}