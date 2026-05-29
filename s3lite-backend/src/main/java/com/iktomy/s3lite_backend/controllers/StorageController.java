package com.iktomy.s3lite_backend.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.iktomy.s3lite.api.StorageApi;

import java.io.InputStream;

@RestController
public class StorageController implements StorageApi {

    private final MetadataService metadataService;
    private final DataService dataService;
    private final AuthService authService;

    public StorageController(MetadataService metadataService, AuthService authService) {
        this.metadataService = metadataService;
        this.authService = authService;
    }

    @Override
    public ResponseEntity<StreamingResponseBody> downloadObject(String bucketName, String objectKey, Long versionId) {

    }

    @Override
    public ResponseEntity<StreamingResponseBody> uploadObject(String bucketName, String objectKey, Long versionId) {

    }

    @Override
    public ResponseEntity<Void> deleteObject(String bucketName, String objectKey, Long versionId) {
        if (versionId != null) {
            metadataService.softDeleteSpecificVersion(bucketName, objectKey, versionId);
        } else {
            metadataService.softDeleteLatestVersion(bucketName, objectKey);
        }

        return ResponseEntity.noContent().build();
    }
}
