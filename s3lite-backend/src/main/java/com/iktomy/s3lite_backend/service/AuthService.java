package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite_backend.model.BucketPermission.PermissionType;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.repository.BucketPermissionRepository;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final BucketPermissionRepository permissionRepository;
    private final BucketRepository bucketRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
            BucketPermissionRepository permissionRepository,
            BucketRepository bucketRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.bucketRepository = bucketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String username, String email, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username '" + username + "' is already taken.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email '" + email + "' is already taken.");
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    public User getUserById(java.util.UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User authenticate(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Invalid credentials."));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }
        return user;
    }

    public void requireReadAccess(String username, String bucketName) {
        // Owner always has access — check ownership first as a fast-path
        if (isOwner(username, bucketName)) return;
        boolean hasAccess = permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.READ);
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have 'read' permission on bucket '" + bucketName + "'.");
        }
    }

    public void requireWriteAccess(String username, String bucketName) {
        // Owner always has access — check ownership first as a fast-path
        if (isOwner(username, bucketName)) return;
        boolean hasAccess = permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.WRITE);
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have 'write' permission on bucket '" + bucketName + "'.");
        }
    }

    public boolean hasReadAccess(String username, String bucketName) {
        return isOwner(username, bucketName) ||
                permissionRepository.existsByUsernameAndBucketNameAndPermission(
                        username, bucketName, PermissionType.READ);
    }

    public boolean hasWriteAccess(String username, String bucketName) {
        return isOwner(username, bucketName) ||
                permissionRepository.existsByUsernameAndBucketNameAndPermission(
                        username, bucketName, PermissionType.WRITE);
    }

    /**
     * Returns true if the given username is the owner of the bucket.
     * This is a safe fallback in case bucket_permissions entries are missing.
     */
    private boolean isOwner(String username, String bucketName) {
        return bucketRepository.findByName(bucketName)
                .map(bucket -> userRepository.findById(bucket.getOwnerId())
                        .map(user -> user.getUsername().equals(username))
                        .orElse(false))
                .orElse(false);
    }
}
