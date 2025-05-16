package com.jobhunthub.jobhunthub.service;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

/**
 * Core user operations: provisioning from OAuth2/OIDC and lookup by provider ID.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Provision a new user or update an existing one based on OAuth2/OIDC attributes.
     */
    @Transactional
    public User authenticateUser(OAuth2User oauth2User, String provider) {
        var attrs = OAuth2UserAttributes.from(oauth2User, provider);
        return userRepository.findByProviderAndProviderId(provider, attrs.providerId())
                .map(user -> updateUser(user, attrs))
                .orElseGet(() -> createNewUser(provider, attrs));
    }

    // Private helper method to update user if needed
    private User updateUser(User user, OAuth2UserAttributes attrs) {
        if (user.getId() == null || hasChanges(user, attrs)) {
            updateUserHelper(user, attrs);
            return userRepository.save(user);
        }
        return user;
    }

    // Private helper method to check if user has changes
    private boolean hasChanges(User user, OAuth2UserAttributes attrs) {
        return !attrs.username().equals(user.getUsername()) ||
               (attrs.email() != null && !attrs.email().equals(user.getEmail())) ||
               (attrs.avatarUrl() != null && !attrs.avatarUrl().equals(user.getAvatarUrl()));
    }

    // Private helper method to update user attributes
    private void updateUserHelper(User user, OAuth2UserAttributes attrs) {
        user.setUsername(attrs.username());
        if (attrs.email() != null) user.setEmail(attrs.email());
        if (attrs.avatarUrl() != null) user.setAvatarUrl(attrs.avatarUrl());
    }

    // Private helper method to create new user
    private User createNewUser(String provider, OAuth2UserAttributes attrs) {
        User newUser = new User();
        newUser.setProvider(provider);
        newUser.setProviderId(attrs.providerId());
        updateUserHelper(newUser, attrs);
        return userRepository.save(newUser);
    }

    // Record to store OAuth2/OIDC attributes
    private record OAuth2UserAttributes(
        String providerId,
        String username,
        String email,
        String avatarUrl
    ) {

        // Static method to extract attributes from OAuth2User
        static OAuth2UserAttributes from(OAuth2User user, String provider) {
            return switch (provider.toLowerCase()) {
                case "github" -> extractAttributes(user, "id", "login", "email", "avatar_url");
                case "google" -> extractAttributes(user, "sub", "name", "email", "picture");
                default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
            };
        }

        // Private helper method to extract attributes from OAuth2User
        private static OAuth2UserAttributes extractAttributes(
                OAuth2User user, 
                String idKey, 
                String nameKey, 
                String emailKey, 
                String avatarKey
        ) {
            Object id = user.getAttribute(idKey);
            if (id == null) {
                throw new ResourceNotFoundException("OAuth2User", idKey, "missing in principal");
            }
            
            String pid = id.toString();
            String name = user.getAttribute(nameKey);
            String email = user.getAttribute(emailKey);
            String avatar = user.getAttribute(avatarKey);
            String uname = name != null && !name.isBlank() ? name : fallbackUsername(email, pid);
            
            return new OAuth2UserAttributes(pid, uname, email, avatar);
        }

        // Private helper method to fallback username if name is not available
        private static String fallbackUsername(String email, String pid) {
            return email != null && email.contains("@") ? email.split("@")[0] : pid;
        }
    }
}
