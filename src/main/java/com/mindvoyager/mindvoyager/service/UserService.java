package com.mindvoyager.mindvoyager.service;

import com.mindvoyager.mindvoyager.model.User;
import com.mindvoyager.mindvoyager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Find user by GitHub ID (used during OAuth)
    public Optional<User> findByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId);
    }

    // Create or update a user
    public User save(User user) {
        return userRepository.save(user);
    }
} 