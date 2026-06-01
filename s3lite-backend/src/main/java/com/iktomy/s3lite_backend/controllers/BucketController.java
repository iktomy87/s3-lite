package com.iktomy.s3lite_backend.controllers;

import com.iktomy.s3lite.api.BucketsApi;
import com.iktomy.s3lite.model.BucketResponse;
import com.iktomy.s3lite.model.ObjectListResponse;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.service.AuthService;
import com.iktomy.s3lite_backend.service.BucketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BucketController implements BucketsApi {

    private final BucketService bucketService;
    private final AuthService authService;

    public BucketController(BucketService bucketService, AuthService authService) {
        this.bucketService = bucketService;
        this.authService = authService;
    }

    @Override
    public ResponseEntity<BucketResponse> createBucket(String bucketName) {
        UserDetails principal = getAuthenticatedUser();
        authService.requireWriteAccess(principal.getUsername(), bucketName);

        User owner = authService.authenticate(principal.getUsername(),
                principal.getPassword() != null ? principal.getPassword() : "");

        BucketResponse response = bucketService.createBucket(bucketName, owner);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ObjectListResponse> listObjects(
            String bucketName,
            String prefix,
            Boolean allVersions) {
        UserDetails principal = getAuthenticatedUser();
        authService.requireReadAccess(principal.getUsername(), bucketName);

        boolean includeAll = allVersions != null && allVersions;
        ObjectListResponse response = bucketService.listObjects(bucketName, prefix, includeAll);
        return ResponseEntity.ok(response);
    }

    private UserDetails getAuthenticatedUser() {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserDetails ud)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Full authentication is required.");
        }
        return ud;
    }
}
