package com.jobhunthub.jobhunthub.service;

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.Mockito.*;

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
                .githubId("123")
                .username("testuser")
                .email("test@test.com")
                .avatarUrl("https://github.com/testuser.png")
                .build();
    }

    @Test
    public void UserService_findByGithubId_returnsUser() {
        // Arrange
        String githubId = "123";
        when(userRepository.findByGithubId(githubId)).thenReturn(Optional.of(user));

        // Act
        Optional<User> foundUser = userService.findByGithubId(githubId);

        // Assert
        Assertions.assertThat(foundUser).isPresent();
        Assertions.assertThat(foundUser.get().getGithubId()).isEqualTo(githubId);
        verify(userRepository, times(1)).findByGithubId(githubId);
    }

    @Test
    public void UserService_findByGithubId_returnsEmpty_whenUserNotFound() {
        // Arrange
        String githubId = "nonexistent";
        when(userRepository.findByGithubId(githubId)).thenReturn(Optional.empty());

        // Act
        Optional<User> foundUser = userService.findByGithubId(githubId);

        // Assert
        Assertions.assertThat(foundUser).isEmpty();
        verify(userRepository, times(1)).findByGithubId(githubId);
    }

    @Test
    public void UserService_save_returnsUser() {
        // Arrange
        User userToSave = User.builder()
                .githubId("456")
                .username("newuser")
                .email("new@test.com")
                .build();
        when(userRepository.save(any(User.class))).thenReturn(userToSave);

        // Act
        User savedUser = userService.save(userToSave);

        // Assert
        Assertions.assertThat(savedUser).isNotNull();
        Assertions.assertThat(savedUser.getGithubId()).isEqualTo("456");
        Assertions.assertThat(savedUser.getUsername()).isEqualTo("newuser");
        verify(userRepository, times(1)).save(userToSave);
    }

    @Test
    public void UserService_save_updatesExistingUser() {
        // Arrange
        user.setUsername("updatedUsername");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        User updatedUser = userService.save(user);

        // Assert
        Assertions.assertThat(updatedUser).isNotNull();
        Assertions.assertThat(updatedUser.getUsername()).isEqualTo("updatedUsername");
        Assertions.assertThat(updatedUser.getGithubId()).isEqualTo("123");
        verify(userRepository, times(1)).save(user);
    }
}
