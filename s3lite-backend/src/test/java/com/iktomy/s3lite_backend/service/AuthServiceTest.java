package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite_backend.model.BucketPermission.PermissionType;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.repository.BucketPermissionRepository;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BucketPermissionRepository permissionRepository;

    @Mock
    private BucketRepository bucketRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, permissionRepository, bucketRepository, passwordEncoder);
        user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("alice");
        user.setPasswordHash("$hashed$");
    }

    @Test
    void authenticate_userNotFound_throws401() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.authenticate("unknown", "pass"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void authenticate_wrongPassword_throws401() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.authenticate("alice", "wrongpass"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void authenticate_correctCredentials_returnsUser() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctpass", user.getPasswordHash())).thenReturn(true);

        User result = authService.authenticate("alice", "correctpass");

        assertThat(result.getUsername()).isEqualTo("alice");
    }

    @Test
    void requireReadAccess_noPermission_throws403() {
        // isOwner() returns false → falls through to permission check
        when(bucketRepository.findByName("my-bucket")).thenReturn(Optional.empty());
        when(permissionRepository.existsByUsernameAndBucketNameAndPermission(
                "alice", "my-bucket", PermissionType.READ)).thenReturn(false);

        assertThatThrownBy(() -> authService.requireReadAccess("alice", "my-bucket"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void requireReadAccess_hasPermission_doesNotThrow() {
        when(bucketRepository.findByName("my-bucket")).thenReturn(Optional.empty());
        when(permissionRepository.existsByUsernameAndBucketNameAndPermission(
                "alice", "my-bucket", PermissionType.READ)).thenReturn(true);

        authService.requireReadAccess("alice", "my-bucket");
    }

    @Test
    void requireWriteAccess_noPermission_throws403() {
        // isOwner() returns false → falls through to permission check
        when(bucketRepository.findByName("my-bucket")).thenReturn(Optional.empty());
        when(permissionRepository.existsByUsernameAndBucketNameAndPermission(
                "alice", "my-bucket", PermissionType.WRITE)).thenReturn(false);

        assertThatThrownBy(() -> authService.requireWriteAccess("alice", "my-bucket"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void requireWriteAccess_hasPermission_doesNotThrow() {
        when(bucketRepository.findByName("my-bucket")).thenReturn(Optional.empty());
        when(permissionRepository.existsByUsernameAndBucketNameAndPermission(
                "alice", "my-bucket", PermissionType.WRITE)).thenReturn(true);

        authService.requireWriteAccess("alice", "my-bucket");
    }
}
