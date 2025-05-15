package com.jobhunthub.jobhunthub.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;

@RestController
@RequestMapping("/api/auth")
public class OAuth2Controller {

    @GetMapping("/user")
    public AuthenticatedUserDTO currentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return new AuthenticatedUserDTO(false);
        }
        
        var user = principal.getDomainUser();
        return new AuthenticatedUserDTO(true, user.getId(), user.getUsername(), 
            user.getEmail(), user.getAvatarUrl());
    }
}
