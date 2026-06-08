package com.iktomy.s3lite_backend.controllers;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.iktomy.s3lite.api.StorageApi;
import com.iktomy.s3lite.model.ObjectMetadata;
import com.iktomy.s3lite_backend.service.AuthService;
import com.iktomy.s3lite_backend.service.DataService;
import com.iktomy.s3lite_backend.service.MetadataService;

@RestController
public class StorageController implements StorageApi {
    private final MetadataService metadataService;
    private final DataService dataService;
    private final AuthService authService;

    public StorageController(MetadataService metadataService, AuthService authService, DataService dataService) {
        this.metadataService = metadataService;
        this.dataService = dataService;
        this.authService = authService;
    }

    @Override
    public ResponseEntity<org.springframework.core.io.Resource> downloadObject(String bucketName, String objectKey,
            Long versionId) {
        authService.requireReadAccess(getAuthenticatedUser().username(), bucketName);
        // Buscamos los metadatos para conocer el tipo
        ObjectMetadata metadata = metadataService.getMetadata(bucketName, objectKey, versionId);
        // pedimos el archivo fisico al servicio de datos
        org.springframework.core.io.Resource fileResource = dataService.loadAsResource(bucketName, objectKey,
                metadata.getVersionId());

        // se construye la repuesta con cabeceras HTTP
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, metadata.getMimeType())
                .body(fileResource);
    }

    @Override
    public ResponseEntity<ObjectMetadata> uploadObject(String bucketName, String objectKey,
            org.springframework.core.io.Resource body) {
        authService.requireWriteAccess(getAuthenticatedUser().username(), bucketName);
        try {
            InputStream fileStream = body.getInputStream();
            long fileSize = body.contentLength();
            String mimeType = "application/octet-stream"; // Simplificado por ahora

            ObjectMetadata nuevaVersion = metadataService.registerNewVersion(bucketName, objectKey, fileSize, mimeType);

            dataService.store(bucketName, objectKey, nuevaVersion.getVersionId(), fileStream);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("X-Version-Id", String.valueOf(nuevaVersion.getVersionId()))
                    .body(nuevaVersion);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Void> deleteObject(String bucketName, String objectKey, Long versionId) {
        authService.requireWriteAccess(getAuthenticatedUser().username(), bucketName);
        if (versionId != null) {
            metadataService.softDeleteSpecificVersion(bucketName, objectKey, versionId);
        } else {
            metadataService.softDeleteLatestVersion(bucketName, objectKey);
        }

        return ResponseEntity.noContent().build();
    }

    private com.iktomy.s3lite_backend.config.JwtAuthenticationFilter.AuthenticatedUser getAuthenticatedUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof com.iktomy.s3lite_backend.config.JwtAuthenticationFilter.AuthenticatedUser au)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Full authentication is required.");
        }
        return au;
    }
}
