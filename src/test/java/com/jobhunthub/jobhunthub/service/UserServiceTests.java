package com.jobhunthub.jobhunthub.service;

import java.util.Optional;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.jobhunthub.jobhunthub.dto.AuthenticatedUserDTO;
import com.jobhunthub.jobhunthub.dto.OAuth2UserAttributes;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.InvalidRequestException;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder()
                .id(1L)
                .githubId("456")
                .build();
    }

    // === AUTHENTICATION TESTS ===

    @Test
    public void authenticateUser_createsNewGithubUser_whenUserDoesNotExist() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("id")).thenReturn("123");
        when(mockOAuth2User.getAttribute("email")).thenReturn("new1@test.com");
        when(mockOAuth2User.getAttribute("avatar_url")).thenReturn("https://github.com/newuser1.png");

        when(userRepository.findByGithubId("123")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(2L); // Simulate database ID assignment
            return savedUser;
        });

        // Act
        User result = userService.authenticateUser(mockOAuth2User, "github");

        // Assert
        Assertions.assertThat(result).isNotNull();
        Assertions.assertThat(result.getGithubId()).isEqualTo("123");
        verify(userRepository).save(any(User.class));
        verify(profileService).provisionProfile(eq(result), any(OAuth2UserAttributes.class));
        verify(profileService).linkProviderEmail(eq(result), any(OAuth2UserAttributes.class), eq("github"));
    }

    @Test
    public void authenticateUser_returnsExistingGithubUser_whenUserExists() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("id")).thenReturn("456");
        when(mockOAuth2User.getAttribute("email")).thenReturn("test1@test.com");
        when(mockOAuth2User.getAttribute("avatar_url")).thenReturn("https://github.com/testuser1.png");

        when(userRepository.findByGithubId("456")).thenReturn(Optional.of(user));

        // Act
        User result = userService.authenticateUser(mockOAuth2User, "github");

        // Assert
        Assertions.assertThat(result).isEqualTo(user);
        Assertions.assertThat(result.getGithubId()).isEqualTo("456");
        verify(profileService, never()).provisionProfile(any(), any());
    }

    @Test
    public void authenticateUser_createsNewGoogleUser_whenUserDoesNotExist() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("sub")).thenReturn("11111");
        when(mockOAuth2User.getAttribute("email")).thenReturn("new2@test.com");
        when(mockOAuth2User.getAttribute("picture")).thenReturn("https://google.com/newuser2.png");

        when(userRepository.findByGoogleId("11111")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(3L);
            return savedUser;
        });

        // Act
        User result = userService.authenticateUser(mockOAuth2User, "google");

        // Assert
        Assertions.assertThat(result).isNotNull();
        Assertions.assertThat(result.getGoogleId()).isEqualTo("11111");
        verify(userRepository).save(any(User.class));
        verify(profileService).provisionProfile(eq(result), any(OAuth2UserAttributes.class));
        verify(profileService).linkProviderEmail(eq(result), any(OAuth2UserAttributes.class), eq("google"));
    }

    @Test
    public void authenticateUser_returnsExistingGoogleUser_whenUserExists() {
        // Arrange
        User googleUser = User.builder()
        .id(1L)
        .googleId("99999")
        .build();

        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("sub")).thenReturn("99999");
        when(mockOAuth2User.getAttribute("email")).thenReturn("test2@test.com");
        when(mockOAuth2User.getAttribute("picture")).thenReturn("https://google.com/testuser2.png");

        when(userRepository.findByGoogleId("99999")).thenReturn(Optional.of(googleUser));

        // Act
        User result = userService.authenticateUser(mockOAuth2User, "google");

        // Assert
        Assertions.assertThat(result).isEqualTo(googleUser);
        Assertions.assertThat(result.getGoogleId()).isEqualTo("99999");
        verify(profileService, never()).provisionProfile(any(), any());
    }

    @Test
    public void authenticateUser_throwsException_whenUnsupportedProvider() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("id")).thenReturn("123");

        // Act & Assert
        Assertions.assertThatThrownBy(() -> 
            userService.authenticateUser(mockOAuth2User, "facebook")
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining("Unsupported provider: facebook");
    }

    // === LINK PROVIDER TESTS ===

    @Test
    public void linkProvider_successfullyLinksGithubProvider() {
        // Arrange
        User userWithoutGithub = User.builder()
                .id(1L)
                .googleId("google123")
                .build();

        when(userRepository.findByGithubId("github456")).thenReturn(Optional.empty());

        // Act
        AuthenticatedUserDTO result = userService.linkProvider(userWithoutGithub, "github456", "github");

        // Assert
        Assertions.assertThat(result).isNotNull();
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.githubLinked()).isTrue();
        Assertions.assertThat(result.googleLinked()).isTrue();
        Assertions.assertThat(userWithoutGithub.getGithubId()).isEqualTo("github456");
    }

    @Test
    public void linkProvider_successfullyLinksGoogleProvider() {
        // Arrange
        User userWithoutGoogle = User.builder()
                .id(1L)
                .githubId("github123")
                .build();

        when(userRepository.findByGoogleId("google456")).thenReturn(Optional.empty());

        // Act
        AuthenticatedUserDTO result = userService.linkProvider(userWithoutGoogle, "google456", "google");

        // Assert
        Assertions.assertThat(result).isNotNull();
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.githubLinked()).isTrue();
        Assertions.assertThat(result.googleLinked()).isTrue();
        Assertions.assertThat(userWithoutGoogle.getGoogleId()).isEqualTo("google456");
    }

    @Test
    public void linkProvider_throwsException_whenProviderAlreadyLinkedToAnotherUser() {
        // Arrange
        User currentUser = User.builder().id(1L).build();
        User existingUser = User.builder().id(2L).githubId("github123").build();

        when(userRepository.findByGithubId("github123")).thenReturn(Optional.of(existingUser));

        // Act & Assert
        Assertions.assertThatThrownBy(() -> 
            userService.linkProvider(currentUser, "github123", "github")
        ).isInstanceOf(InvalidRequestException.class)
         .hasMessageContaining("This github account is already linked to another user");
    }

    @Test
    public void linkProvider_allowsLinkingToSameUser() {
        // Arrange
        User currentUser = User.builder().id(1L).githubId("github123").build();

        when(userRepository.findByGithubId("github123")).thenReturn(Optional.of(currentUser));

        // Act
        AuthenticatedUserDTO result = userService.linkProvider(currentUser, "github123", "github");

        // Assert
        Assertions.assertThat(result).isNotNull();
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.githubLinked()).isTrue();
    }

    @Test
    public void linkProvider_throwsException_whenUnsupportedProvider() {
        // Arrange
        User currentUser = User.builder().id(1L).build();

        // Act & Assert
        Assertions.assertThatThrownBy(() -> 
            userService.linkProvider(currentUser, "facebook123", "facebook")
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining("Unsupported provider: facebook");
    }

    // === DTO TESTS ===

    @Test
    public void getAuthenticatedUserDTO_returnsCorrectStatus_whenBothProvidersLinked() {
        // Arrange
        User userWithBothProviders = User.builder()
                .id(1L)
                .githubId("github123")
                .googleId("google123")
                .build();

        // Act
        AuthenticatedUserDTO result = userService.getAuthenticatedUserDTO(userWithBothProviders);

        // Assert
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.id()).isEqualTo(1L);
        Assertions.assertThat(result.githubLinked()).isTrue();
        Assertions.assertThat(result.googleLinked()).isTrue();
    }

    @Test
    public void getAuthenticatedUserDTO_returnsCorrectStatus_whenOnlyGithubLinked() {
        // Arrange
        User userWithGithubOnly = User.builder()
                .id(1L)
                .githubId("github123")
                .build();

        // Act
        AuthenticatedUserDTO result = userService.getAuthenticatedUserDTO(userWithGithubOnly);

        // Assert
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.id()).isEqualTo(1L);
        Assertions.assertThat(result.githubLinked()).isTrue();
        Assertions.assertThat(result.googleLinked()).isFalse();
    }

    @Test
    public void getAuthenticatedUserDTO_returnsCorrectStatus_whenOnlyGoogleLinked() {
        // Arrange
        User userWithGoogleOnly = User.builder()
                .id(1L)
                .googleId("google123")
                .build();

        // Act
        AuthenticatedUserDTO result = userService.getAuthenticatedUserDTO(userWithGoogleOnly);

        // Assert
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.id()).isEqualTo(1L);
        Assertions.assertThat(result.githubLinked()).isFalse();
        Assertions.assertThat(result.googleLinked()).isTrue();
    }

    @Test
    public void getAuthenticatedUserDTO_returnsCorrectStatus_whenNoProvidersLinked() {
        // Arrange
        User userWithNoProviders = User.builder()
                .id(1L)
                .build();

        // Act
        AuthenticatedUserDTO result = userService.getAuthenticatedUserDTO(userWithNoProviders);

        // Assert
        Assertions.assertThat(result.authenticated()).isTrue();
        Assertions.assertThat(result.id()).isEqualTo(1L);
        Assertions.assertThat(result.githubLinked()).isFalse();
        Assertions.assertThat(result.googleLinked()).isFalse();
    }
}
