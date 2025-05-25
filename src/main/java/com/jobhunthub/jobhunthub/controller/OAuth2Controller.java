package com.jobhunthub.jobhunthub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;
import com.jobhunthub.jobhunthub.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class OAuth2Controller {

    private final UserService userService;

    public OAuth2Controller(UserService userService) {
        this.userService = userService;
    }

    // Get the current user's authentication status
    @GetMapping("/user")
    public ResponseEntity<AuthenticatedUserDTO> currentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.ok(new AuthenticatedUserDTO(false));
        }
        
        AuthenticatedUserDTO userDTO = userService.getAuthenticatedUserDTO(principal.getDomainUser());
        return ResponseEntity.ok(userDTO);
    }

    // Link a provider to a user's account
    @PostMapping("/link-provider")
    public ResponseEntity<AuthenticatedUserDTO> linkProvider(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String provider,
            @RequestParam String providerId) {

        if (provider == null || provider.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (providerId == null || providerId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        AuthenticatedUserDTO updatedUserDTO = userService.linkProvider(principal.getDomainUser(), providerId, provider);
        return ResponseEntity.ok(updatedUserDTO);
    }
}
