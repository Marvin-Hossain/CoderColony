package com.jobhunthub.jobhunthub.dto;

import org.springframework.security.oauth2.core.user.OAuth2User;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.ResourceNotFoundException;

/**
 * A DTO for holding the essential attributes extracted from an OAuth2User.
 */
public record OAuth2UserAttributes(
        String providerId,
        String email,
        String avatarUrl
) {
    /**
     * Extracts attributes based on the OAuth2 provider.
     */
    public static OAuth2UserAttributes from(OAuth2User user, String provider) {
        return switch (provider.toLowerCase()) {
            case "github" -> extractAttributes(user, "id", "email", "avatar_url");
            case "google" -> extractAttributes(user, "sub", "email", "picture");
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    private static OAuth2UserAttributes extractAttributes(
            OAuth2User user,
            String idKey,
            String emailKey,
            String avatarKey
    ) {
        Object id = user.getAttribute(idKey);
        if (id == null) {
            throw new ResourceNotFoundException(
                    "OAuth2User", idKey, "missing in principal"
            );
        }
        String pid = id.toString();
        String email = user.getAttribute(emailKey);
        String avatar = user.getAttribute(avatarKey);
        return new OAuth2UserAttributes(pid, email, avatar);
    }
}
