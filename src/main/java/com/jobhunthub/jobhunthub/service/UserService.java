package com.jobhunthub.jobhunthub.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;
import com.jobhunthub.jobhunthub.dto.OAuth2UserAttributes;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.InvalidRequestException;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

/**
 * Core user operations: OAuth2 authentication and provider linking.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfileService profileService;

    public UserService(UserRepository userRepository, ProfileService profileService) {
        this.userRepository = userRepository;
        this.profileService = profileService;
    }

    // AUTHENTICATION OPERATIONS

    /**
     * Authenticate a user based on OAuth2/OIDC attributes.
     */
    @Transactional
    public User authenticateUser(OAuth2User oauth2User, String provider) {
        var attrs = OAuth2UserAttributes.from(oauth2User, provider);

        // Check if linking to existing session
        Authentication current = SecurityContextHolder.getContext().getAuthentication();
        if (current instanceof OAuth2AuthenticationToken token
                && token.isAuthenticated()
                && token.getPrincipal() instanceof UserPrincipal up) {
            User currentUser = up.getDomainUser();
            linkProvider(currentUser, attrs.providerId(), provider);
            userRepository.save(currentUser);
            profileService.linkProviderEmail(currentUser, attrs, provider);
            return currentUser;
        }

        // Try to find existing user
        User user = findUserByProvider(attrs.providerId(), provider);
        if (user != null) {
            return user;
        }

        // Create new user
        return createNewUser(attrs, provider);
    }

    // Link a provider to a user's account
    @Transactional
    public AuthenticatedUserDTO linkProvider(User user, String providerId, String provider) {
        validateProviderNotLinked(providerId, provider, user.getId());
        setProviderOnUser(user, providerId, provider);
        
        // Return updated DTO after linking
        return getAuthenticatedUserDTO(user);
    }


    // Get authentication status DTO for a user
    public AuthenticatedUserDTO getAuthenticatedUserDTO(User user) {
        boolean googleLinked = user.getGoogleId() != null;
        boolean githubLinked = user.getGithubId() != null;
        return new AuthenticatedUserDTO(true, user.getId(), googleLinked, githubLinked);
    }

    // PRIVATE HELPER METHODS

    // Find a user by provider ID and provider
    private User findUserByProvider(String providerId, String provider) {
        return switch(provider.toLowerCase()) {
            case "github" -> userRepository.findByGithubId(providerId).orElse(null);
            case "google" -> userRepository.findByGoogleId(providerId).orElse(null);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    // Create a new user
    private User createNewUser(OAuth2UserAttributes attrs, String provider) {
        User newUser = new User();
        setProviderOnUser(newUser, attrs.providerId(), provider);
        newUser = userRepository.save(newUser);
        profileService.provisionProfile(newUser, attrs);
        profileService.linkProviderEmail(newUser, attrs, provider);
        return newUser;
    }

    // Validate that a provider is not already linked to another user
    private void validateProviderNotLinked(String providerId, String provider, Long excludeUserId) {
        User existingUser = findUserByProvider(providerId, provider);
        if (existingUser != null && !existingUser.getId().equals(excludeUserId)) {
            throw new InvalidRequestException(
                "This " + provider + " account is already linked to another user"
            );
        }
    }

    // Set a provider on a user
    private void setProviderOnUser(User user, String providerId, String provider) {
        switch (provider.toLowerCase()) {
            case "github" -> user.setGithubId(providerId);
            case "google" -> user.setGoogleId(providerId);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }
}
