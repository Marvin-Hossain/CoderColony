package com.jobhunthub.jobhunthub.dto;

// Using Java Record for an immutable DTO
public record AuthenticatedUserDTO(
    boolean authenticated,
    Long id,
    String username,
    String email,
    String avatarUrl
) {
    /**
     * Convenience constructor for creating a DTO representing an unauthenticated state
     * or a failure to retrieve user details.
     * @param authenticated should be false for this use case.
     */
    public AuthenticatedUserDTO(boolean authenticated) {
        this(authenticated, null, null, null, null);
    }
} 