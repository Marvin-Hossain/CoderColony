package com.jobhunthub.jobhunthub.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.AuthenticationException;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Create or update a user
    public User save(User user) {
        return userRepository.save(user);
    }

    public OAuth2AuthenticationToken validateAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Authentication failed: null or not authenticated");
            throw new AuthenticationException("User not authenticated");
        }
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            logger.warn("Authentication failed: invalid token type {}", authentication.getClass().getName());
            throw new AuthenticationException("Invalid authentication token type");
        }
        return oauthToken;
    }

    /**
     * Gets the User entity for the authenticated user.
     * Used internally by controllers and other services.
     */
    public User getAuthenticatedUserEntity(Authentication authentication) {
        OAuth2AuthenticationToken oauthToken = validateAuthentication(authentication);
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        
        OAuth2UserAttributes attributes = extractAttributes(oAuth2User, registrationId);

        return userRepository.findByProviderAndProviderId(registrationId, attributes.providerId())
                .orElseThrow(() -> {
                    logger.warn("User not found: {} ({})", attributes.username(), registrationId);
                    return new ResourceNotFoundException("User", "provider/providerId", 
                        registrationId + "/" + attributes.providerId());
                });
    }

    // Method to get the DTO for API responses (e.g., for OAuth2Controller)
    public AuthenticatedUserDTO getAuthenticatedUserDetails(Authentication authentication) {
        try {
            User user = getAuthenticatedUserEntity(authentication); 
            return new AuthenticatedUserDTO(true, user.getId(), user.getUsername(), user.getEmail(), user.getAvatarUrl());
        } catch (Exception e) {
            logger.warn("Failed to get user details: {}", e.getMessage());
            return new AuthenticatedUserDTO(false);
        }
    }

    /**
     * Finds an existing user by their provider-specific ID (GitHub ID or Google SUB)
     * or creates a new one. Updates username, email, and avatar URL if they have changed.
     *
     * @param oAuth2User The principal from OAuth2 authentication.
     * @param registrationId The registration ID of the OAuth2 provider (e.g., "gitHub", "google").
     * @return The managed (saved or updated) User entity.
     * @throws AuthenticationException if essential attributes are missing from the principal or unknown provider.
     */
    public User provisionOrUpdateUserFromOAuth2(OAuth2User oAuth2User, String registrationId) {
        if (registrationId == null || registrationId.trim().isEmpty()) {
            throw new AuthenticationException("Registration ID is required to provision user.");
        }
        
        OAuth2UserAttributes attributes = extractAttributes(oAuth2User, registrationId);
        logger.info("Processing user {} from {}", attributes.username(), registrationId);

        Optional<User> existingUserOpt = userRepository.findByProviderAndProviderId(registrationId, attributes.providerId());
        User user;
        boolean isNewUser = existingUserOpt.isEmpty();

        if (isNewUser) {
            user = new User();
            user.setProvider(registrationId);
            user.setProviderId(attributes.providerId());
        } else {
            user = existingUserOpt.get();
        }

        boolean attributesChanged = false;
        if (!attributes.username().equals(user.getUsername())) {
            user.setUsername(attributes.username());
            attributesChanged = true;
        }
        if (attributes.email() != null && !attributes.email().equals(user.getEmail())) {
            user.setEmail(attributes.email());
            attributesChanged = true;
        }
        if (attributes.avatarUrl() != null && !attributes.avatarUrl().equals(user.getAvatarUrl())) {
            user.setAvatarUrl(attributes.avatarUrl());
            attributesChanged = true;
        }

        if (isNewUser || attributesChanged) {
            logger.info("Saving {} user {}", isNewUser ? "new" : "updated", user.getUsername());
            return userRepository.save(user);
        } else {
            logger.debug("No changes needed for user {}", user.getUsername());
            return user;
        }
    }

    private OAuth2UserAttributes extractAttributes(OAuth2User oAuth2User, String registrationId) {
        if (oAuth2User == null) {
            throw new AuthenticationException("OAuth2 principal is null");
        }

        return switch (registrationId) {
            case "github" -> {
                Object idAttr = oAuth2User.getAttribute("id");
                if (idAttr == null) {
                    throw new AuthenticationException("Essential GitHub user attribute (id) missing");
                }
                String providerSpecificId = idAttr.toString();
                String username = oAuth2User.getAttribute("login");
                String email = oAuth2User.getAttribute("email");
                String avatarUrl = oAuth2User.getAttribute("avatar_url");
                
                if (username == null) {
                    username = email != null ? email.split("@")[0] : providerSpecificId;
                    logger.warn("Using '{}' as username for {} user", username, registrationId);
                }
                
                yield new OAuth2UserAttributes(providerSpecificId, username, email, avatarUrl);
            }
            
            case "google" -> {
                Object idAttr = oAuth2User.getAttribute("sub");
                if (idAttr == null) {
                    throw new AuthenticationException("Essential Google user attribute (sub) missing.");
                }
                String providerSpecificId = idAttr.toString();
                String email = oAuth2User.getAttribute("email");
                String username = oAuth2User.getAttribute("name");
                String avatarUrl = oAuth2User.getAttribute("picture");
                
                if (username == null || username.trim().isEmpty()) {
                    username = email != null && email.contains("@") ? email.split("@")[0] : providerSpecificId;
                    logger.warn("Using '{}' as username for Google user", username);
                }
                
                yield new OAuth2UserAttributes(providerSpecificId, username, email, avatarUrl);
            }
            
            default -> throw new AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        };
    }

    public String getUserIdentifierForLogging(OAuth2User oAuth2User, String registrationId) {
        return switch (registrationId) {
            case "github" -> {
                String login = oAuth2User.getAttribute("login");
                yield login != null ? login : oAuth2User.getName();
            }
            case "google" -> {
                String email = oAuth2User.getAttribute("email");
                yield email != null ? email : oAuth2User.getName();
            }
            default -> oAuth2User.getName() != null ? oAuth2User.getName() : "UNKNOWN_USER";
        };
    }

    private record OAuth2UserAttributes(String providerId, String username, String email, String avatarUrl) {}
}