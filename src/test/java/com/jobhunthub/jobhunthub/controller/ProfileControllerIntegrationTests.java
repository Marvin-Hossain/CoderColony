package com.jobhunthub.jobhunthub.controller;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobhunthub.jobhunthub.config.UserPrincipal;
import com.jobhunthub.jobhunthub.dto.UpdateProfileRequestDTO;
import com.jobhunthub.jobhunthub.model.Profile;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.ProfileRepository;
import com.jobhunthub.jobhunthub.repository.UserRepository;

/**
 * Integration tests for ProfileController.
 * Tests profile retrieval and update functionality:
 * - Get current user profile
 * - Update profile information
 * - Validation and error handling
 * - Authentication requirements
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class ProfileControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserPrincipal userWithCompletePrincipal;
    private UserPrincipal userWithMinimalPrincipal;
    private UserPrincipal userWithBothProvidersPrincipal;

    @BeforeEach
    public void setUp() {
        setupUserWithCompleteProfile();
        setupUserWithMinimalProfile();
        setupUserWithBothProviders();
    }

    private void setupUserWithCompleteProfile() {
        User user = new User();
        user.setGithubId("github123");
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setUsername("completeuser");
        profile.setPrimaryEmail("complete@test.com");
        profile.setGithubEmail("github@complete.com");
        profile.setAvatarUrl("https://github.com/completeuser.png");
        profileRepository.save(profile);

        var delegate = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),
                Map.of(
                    "id", "github123",
                    "login", "completeuser",
                    "email", "complete@test.com",
                    "avatar_url", "https://github.com/completeuser.png"
                ),
                "id"
        );

        this.userWithCompletePrincipal = new UserPrincipal(delegate, user);
    }

    private void setupUserWithMinimalProfile() {
        User user = new User();
        user.setGoogleId("google123");
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setPrimaryEmail("minimal@test.com");
        // No username, no avatar, only Google email
        profile.setGoogleEmail("minimal@test.com");
        profileRepository.save(profile);

        var delegate = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),
                Map.of(
                    "sub", "google123",
                    "email", "minimal@test.com"
                ),
                "sub"
        );

        this.userWithMinimalPrincipal = new UserPrincipal(delegate, user);
    }

    private void setupUserWithBothProviders() {
        User user = new User();
        user.setGithubId("github456");
        user.setGoogleId("google456");
        user = userRepository.save(user);

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setUsername("bothuser");
        profile.setPrimaryEmail("both@test.com");
        profile.setGithubEmail("github@both.com");
        profile.setGoogleEmail("google@both.com");
        profile.setAvatarUrl("https://github.com/bothuser.png");
        profileRepository.save(profile);

        var delegate = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OAUTH2_USER")),
                Map.of(
                    "id", "github456",
                    "login", "bothuser",
                    "email", "both@test.com",
                    "avatar_url", "https://github.com/bothuser.png"
                ),
                "id"
        );

        this.userWithBothProvidersPrincipal = new UserPrincipal(delegate, user);
    }

    // === GET PROFILE TESTS ===

    @Test
    public void getCurrentUserProfile_returnsCompleteProfile_whenUserHasAllFields() throws Exception {
        mockMvc
                .perform(get("/api/profile/user")
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("completeuser"))
                .andExpect(jsonPath("$.primaryEmail").value("complete@test.com"))
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/completeuser.png"))
                .andExpect(jsonPath("$.githubEmail").value("github@complete.com"))
                .andExpect(jsonPath("$.googleEmail").doesNotExist());
    }

    @Test
    public void getCurrentUserProfile_returnsMinimalProfile_whenUserHasMinimalFields() throws Exception {
        mockMvc
                .perform(get("/api/profile/user")
                        .with(oauth2Login().oauth2User(userWithMinimalPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").doesNotExist())
                .andExpect(jsonPath("$.primaryEmail").value("minimal@test.com"))
                .andExpect(jsonPath("$.avatarUrl").doesNotExist())
                .andExpect(jsonPath("$.githubEmail").doesNotExist())
                .andExpect(jsonPath("$.googleEmail").value("minimal@test.com"));
    }

    @Test
    public void getCurrentUserProfile_returnsBothProviders_whenUserHasBothLinked() throws Exception {
        mockMvc
                .perform(get("/api/profile/user")
                        .with(oauth2Login().oauth2User(userWithBothProvidersPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("bothuser"))
                .andExpect(jsonPath("$.primaryEmail").value("both@test.com"))
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/bothuser.png"))
                .andExpect(jsonPath("$.githubEmail").value("github@both.com"))
                .andExpect(jsonPath("$.googleEmail").value("google@both.com"));
    }

    @Test
    public void getCurrentUserProfile_requiresAuthentication_whenNotLoggedIn() throws Exception {
        mockMvc
                .perform(get("/api/profile/user"))
                .andDo(print())
                .andExpect(status().isFound()); // 302 redirect to login
    }

    // === UPDATE PROFILE TESTS ===

    @Test
    public void updateCurrentUserProfile_updatesUsername_whenUsernameIsUnique() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("newusername");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("newusername"))
                .andExpect(jsonPath("$.primaryEmail").value("complete@test.com")) // Unchanged
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/completeuser.png")); // Unchanged
    }

    @Test
    public void updateCurrentUserProfile_updatesPrimaryEmail_whenEmailIsUnique() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setPrimaryEmail("newemail@test.com");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("completeuser")) // Unchanged
                .andExpect(jsonPath("$.primaryEmail").value("newemail@test.com"))
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/completeuser.png")); // Unchanged
    }

    @Test
    public void updateCurrentUserProfile_updatesAvatarUrl_always() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setAvatarUrl("https://newavatar.com/image.png");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("completeuser")) // Unchanged
                .andExpect(jsonPath("$.primaryEmail").value("complete@test.com")) // Unchanged
                .andExpect(jsonPath("$.avatarUrl").value("https://newavatar.com/image.png"));
    }

    @Test
    public void updateCurrentUserProfile_updatesAllFields_whenAllAreValid() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("allupdated");
        updateRequest.setPrimaryEmail("allupdated@test.com");
        updateRequest.setAvatarUrl("https://allupdated.com/avatar.png");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("allupdated"))
                .andExpect(jsonPath("$.primaryEmail").value("allupdated@test.com"))
                .andExpect(jsonPath("$.avatarUrl").value("https://allupdated.com/avatar.png"))
                .andExpect(jsonPath("$.githubEmail").value("github@complete.com")) // Unchanged
                .andExpect(jsonPath("$.googleEmail").doesNotExist()); // Still null
    }

    @Test
    public void updateCurrentUserProfile_updatesMinimalProfile_successfully() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("minimalupdated");
        updateRequest.setAvatarUrl("https://minimal.com/avatar.png");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithMinimalPrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("minimalupdated"))
                .andExpect(jsonPath("$.primaryEmail").value("minimal@test.com")) // Unchanged
                .andExpect(jsonPath("$.avatarUrl").value("https://minimal.com/avatar.png"))
                .andExpect(jsonPath("$.googleEmail").value("minimal@test.com")); // Unchanged
    }

    @Test
    public void updateCurrentUserProfile_allowsEmptyUpdate_withoutChangingAnything() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        // All fields are null

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("completeuser")) // Unchanged
                .andExpect(jsonPath("$.primaryEmail").value("complete@test.com")) // Unchanged
                .andExpect(jsonPath("$.avatarUrl").value("https://github.com/completeuser.png")); // Unchanged
    }

    // === ERROR HANDLING TESTS ===

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenUsernameAlreadyExists() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("bothuser"); // Username already used by userWithBothProvidersPrincipal

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenEmailAlreadyExists() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setPrimaryEmail("both@test.com"); // Email already used by userWithBothProvidersPrincipal

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenUsernameIsEmpty() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("   "); // Empty/whitespace username

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenEmailIsInvalid() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setPrimaryEmail("invalidemail"); // No @ symbol

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateCurrentUserProfile_allowsSameValues_withoutError() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("completeuser"); // Same as current username
        updateRequest.setPrimaryEmail("complete@test.com"); // Same as current email

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("completeuser"))
                .andExpect(jsonPath("$.primaryEmail").value("complete@test.com"));
    }

    @Test
    public void updateCurrentUserProfile_requiresAuthentication_whenNotLoggedIn() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("newusername");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isFound()); // 302 redirect to login
    }

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenInvalidJson() throws Exception {
        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"username\": \"test\", }")
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateCurrentUserProfile_returnsBadRequest_whenMissingContentType() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("newusername");

        mockMvc
                .perform(put("/api/profile/user")
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isUnsupportedMediaType()); // 415
    }

    // === EDGE CASE TESTS ===

    @Test
    public void updateCurrentUserProfile_handlesSpecialCharacters_inUsername() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        updateRequest.setUsername("user-with_special.chars123");

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user-with_special.chars123"));
    }

    @Test
    public void updateCurrentUserProfile_handlesLongAvatarUrl_successfully() throws Exception {
        UpdateProfileRequestDTO updateRequest = new UpdateProfileRequestDTO();
        String longUrl = "https://very-long-domain-name-for-testing-purposes.example.com/path/to/very/long/avatar/image/file/name/that/might/be/used/in/real/world/scenarios/avatar.png";
        updateRequest.setAvatarUrl(longUrl);

        mockMvc
                .perform(put("/api/profile/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(oauth2Login().oauth2User(userWithCompletePrincipal)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value(longUrl));
    }
} 