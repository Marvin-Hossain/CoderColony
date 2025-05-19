package com.jobhunthub.jobhunthub.service;

import java.util.Optional;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;

public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder()
                .id(1L)
                .provider("github")
                .providerId("456")
                .username("testuser1")
                .email("test1@test.com")
                .avatarUrl("https://github.com/testuser1.png")
                .build();
    }

    @Test
    public void UserService_authenticateUser_returnsNewGithubUser() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("id")).thenReturn("123");
        when(mockOAuth2User.getAttribute("login")).thenReturn("newuser1");
        when(mockOAuth2User.getAttribute("email")).thenReturn("new1@test.com");
        when(mockOAuth2User.getAttribute("avatar_url")).thenReturn("https://github.com/newuser1.png");

        when(userRepository.findByProviderAndProviderId("github", "123"))
            .thenReturn(Optional.empty());

        // Mock the save to return a new user
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            return savedUser;  // Return the same user that was passed to save
        });

        // Act
        User newUser = userService.authenticateUser(mockOAuth2User, "github");

        // Assert
        verify(userRepository).save(any(User.class));
        Assertions.assertThat(newUser).isNotNull();
        Assertions.assertThat(newUser.getProvider()).isEqualTo("github");
        Assertions.assertThat(newUser.getProviderId()).isEqualTo("123");
        Assertions.assertThat(newUser.getUsername()).isEqualTo("newuser1");
        Assertions.assertThat(newUser.getEmail()).isEqualTo("new1@test.com");
        Assertions.assertThat(newUser.getAvatarUrl()).isEqualTo("https://github.com/newuser1.png");
    }

    @Test
    public void UserService_authenticateUser_returnsCurrentGithubUser() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("id")).thenReturn("456");
        when(mockOAuth2User.getAttribute("login")).thenReturn("testuser1");
        when(mockOAuth2User.getAttribute("email")).thenReturn("test1@test.com");
        when(mockOAuth2User.getAttribute("avatar_url")).thenReturn("https://github.com/testuser1.png");

        when(userRepository.findByProviderAndProviderId("github", "456"))
            .thenReturn(Optional.of(user));

        // Act
        User newUser = userService.authenticateUser(mockOAuth2User, "github");

        // Assert
        Assertions.assertThat(newUser).isNotNull();
        Assertions.assertThat(newUser.getProvider()).isEqualTo("github");
        Assertions.assertThat(newUser.getProviderId()).isEqualTo("456");
        Assertions.assertThat(newUser.getUsername()).isEqualTo("testuser1");
        Assertions.assertThat(newUser.getEmail()).isEqualTo("test1@test.com");
        Assertions.assertThat(newUser.getAvatarUrl()).isEqualTo("https://github.com/testuser1.png");
    }
    @Test
    public void UserService_authenticateUser_returnsNewGoogleUser() {
        // Arrange
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("sub")).thenReturn("11111");
        when(mockOAuth2User.getAttribute("name")).thenReturn("newuser2");
        when(mockOAuth2User.getAttribute("email")).thenReturn("new2@test.com");
        when(mockOAuth2User.getAttribute("picture")).thenReturn("https://google.com/newuser2.png");

        when(userRepository.findByProviderAndProviderId("google", "11111"))
            .thenReturn(Optional.empty());

        // Mock the save to return a new user
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            return savedUser;  // Return the same user that was passed to save
        });

        // Act
        User newUser = userService.authenticateUser(mockOAuth2User, "google");

        // Assert
        verify(userRepository).save(any(User.class));
        Assertions.assertThat(newUser).isNotNull();
        Assertions.assertThat(newUser.getProvider()).isEqualTo("google");
        Assertions.assertThat(newUser.getProviderId()).isEqualTo("11111");
        Assertions.assertThat(newUser.getUsername()).isEqualTo("newuser2");
        Assertions.assertThat(newUser.getEmail()).isEqualTo("new2@test.com");
        Assertions.assertThat(newUser.getAvatarUrl()).isEqualTo("https://google.com/newuser2.png");
    }

    @Test
    public void UserService_authenticateUser_returnsCurrentGoogleUser() {
        // Arrange
        user = User.builder()
        .id(1L)
        .provider("google")
        .providerId("99999")
        .username("testuser2")
        .email("test2@test.com")
        .avatarUrl("https://google.com/testuser2.png")
        .build();

        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttribute("sub")).thenReturn("99999");
        when(mockOAuth2User.getAttribute("name")).thenReturn("testuser2");
        when(mockOAuth2User.getAttribute("email")).thenReturn("test2@test.com");
        when(mockOAuth2User.getAttribute("picture")).thenReturn("https://google.com/testuser2.png");

        when(userRepository.findByProviderAndProviderId("google", "99999"))
            .thenReturn(Optional.of(user));

        // Act
        User newUser = userService.authenticateUser(mockOAuth2User, "google");

        // Assert
        Assertions.assertThat(newUser).isNotNull();
        Assertions.assertThat(newUser.getProvider()).isEqualTo("google");
        Assertions.assertThat(newUser.getProviderId()).isEqualTo("99999");
        Assertions.assertThat(newUser.getUsername()).isEqualTo("testuser2");
        Assertions.assertThat(newUser.getEmail()).isEqualTo("test2@test.com");
        Assertions.assertThat(newUser.getAvatarUrl()).isEqualTo("https://google.com/testuser2.png");
    }
}
