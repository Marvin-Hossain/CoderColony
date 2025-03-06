package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.repository.UserRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public Optional<User> findByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId);
    }
    
    public User save(User user) {
        return userRepository.save(user);
    }
    
    /**
     * Gets the currently authenticated user.
     * @return The current user
     * @throws UsernameNotFoundException if no user is authenticated
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication instanceof AnonymousAuthenticationToken) {
            throw new UsernameNotFoundException("No authenticated user found");
        }
        
        String githubId = authentication.getName();
        return userRepository.findByGithubId(githubId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with GitHub ID: " + githubId));
    }
} 