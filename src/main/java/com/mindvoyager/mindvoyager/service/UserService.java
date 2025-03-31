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

    public Optional<User> findByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
} 