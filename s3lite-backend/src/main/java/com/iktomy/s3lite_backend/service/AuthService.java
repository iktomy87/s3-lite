package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite_backend.model.BucketPermission.PermissionType;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.repository.BucketPermissionRepository;
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
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
            BucketPermissionRepository permissionRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
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
        boolean hasAccess = permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.READ);
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have 'read' permission on bucket '" + bucketName + "'.");
        }
    }

    public void requireWriteAccess(String username, String bucketName) {
        boolean hasAccess = permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.WRITE);
        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User does not have 'write' permission on bucket '" + bucketName + "'.");
        }
    }

    public boolean hasReadAccess(String username, String bucketName) {
        return permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.READ);
    }

    public boolean hasWriteAccess(String username, String bucketName) {
        return permissionRepository.existsByUsernameAndBucketNameAndPermission(
                username, bucketName, PermissionType.WRITE);
    }
}
