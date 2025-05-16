package com.jobhunthub.jobhunthub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobhunthub.jobhunthub.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
