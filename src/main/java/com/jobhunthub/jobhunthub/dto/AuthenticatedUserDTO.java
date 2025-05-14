package com.jobhunthub.jobhunthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUserDTO {
    private boolean authenticated;
    private Long id;
    private String username;
    private String email;
    private String avatarUrl;

    public AuthenticatedUserDTO(boolean authenticated) {
        this.authenticated = authenticated;
    }
} 