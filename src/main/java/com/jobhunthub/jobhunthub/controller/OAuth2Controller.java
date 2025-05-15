package com.jobhunthub.jobhunthub.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;
import com.jobhunthub.jobhunthub.service.UserService;

/**
 * Controller for OAuth2 related actions, primarily to fetch authenticated user details.
 */
@RestController
public class OAuth2Controller {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);

    private final UserService userService;

    public OAuth2Controller(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the details of the currently authenticated user.
     * If the user is authenticated, it returns their ID, username, email, and avatar URL.
     * Otherwise, it indicates that the user is not authenticated.
     *
     * @param authentication The {@link Authentication} object from Spring Security.
     * @return A DTO containing user details and authentication status.
     */
    @GetMapping("/api/auth/user")
    public ResponseEntity<AuthenticatedUserDTO> getUser(Authentication authentication) {
        AuthenticatedUserDTO userDTO = userService.getAuthenticatedUserDetails(authentication);
        
        if (userDTO.authenticated()) {
            logger.info("Retrieved user: {}", userDTO.username());
        } else {
            logger.warn("Authentication failed: user not authenticated");
        }
        
        return ResponseEntity.ok(userDTO);
    }
}