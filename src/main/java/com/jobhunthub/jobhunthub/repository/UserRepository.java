package com.jobhunthub.jobhunthub.repository;

import com.jobhunthub.jobhunthub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their Provider ID
    Optional<User> findByProviderId(String providerId);
}
