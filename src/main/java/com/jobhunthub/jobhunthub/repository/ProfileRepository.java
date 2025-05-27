package com.jobhunthub.jobhunthub.repository;

import java.util.Optional;

import com.jobhunthub.jobhunthub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jobhunthub.jobhunthub.model.Profile;


public interface ProfileRepository extends JpaRepository<Profile, Long> {
    /** Lookup the profile for a given user. */
    Optional<Profile> findByUser(User user);

    /** Convenience lookup by user’s PK. */
    Optional<Profile> findByUser_Id(Long userId);

    /** Prevent two profiles sharing the same primary email. */
    boolean existsByPrimaryEmail(String email);

    /** Prevent two profiles sharing the same GitHub email. */
    boolean existsByGithubEmail(String email);

    /** Prevent two profiles sharing the same Google email. */
    boolean existsByGoogleEmail(String email);

    /** Enforce unique usernames. */
    boolean existsByUsername(String username);
}