package com.jobhunthub.jobhunthub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.ProfileDTO;
import com.jobhunthub.jobhunthub.dto.UpdateProfileRequestDTO;
import com.jobhunthub.jobhunthub.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // Get the current user's profile
    @GetMapping("/user")
    public ResponseEntity<ProfileDTO> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal me) {
        ProfileDTO profile = profileService.getProfileByUser(me.getDomainUser());
        return ResponseEntity.ok(profile);
    }

    // Update the current user's profile
    @PutMapping("/user")
    public ResponseEntity<ProfileDTO> updateCurrentUserProfile(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody UpdateProfileRequestDTO updateRequest) {
        
        ProfileDTO updatedProfile = profileService.updateProfile(me.getDomainUser(), updateRequest);
        return ResponseEntity.ok(updatedProfile);
    }
}
