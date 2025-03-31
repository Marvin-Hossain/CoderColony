package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their GitHub ID
    Optional<User> findByGithubId(String githubId);
}
