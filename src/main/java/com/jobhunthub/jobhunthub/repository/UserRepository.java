package com.jobhunthub.jobhunthub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobhunthub.jobhunthub.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Updated method to find a user by their provider and provider-specific ID
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
