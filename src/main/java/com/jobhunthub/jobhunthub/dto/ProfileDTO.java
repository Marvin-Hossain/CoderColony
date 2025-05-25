package com.jobhunthub.jobhunthub.dto;

import com.jobhunthub.jobhunthub.model.Profile;

public record ProfileDTO(
    String username,
    String primaryEmail,
    String avatarUrl,
    String githubEmail,
    String googleEmail
) {
    public static ProfileDTO fromEntity(Profile profile) {
        return new ProfileDTO(
            profile.getUsername(),
            profile.getPrimaryEmail(),
            profile.getAvatarUrl(),
            profile.getGithubEmail(),
            profile.getGoogleEmail()
        );
    }
}