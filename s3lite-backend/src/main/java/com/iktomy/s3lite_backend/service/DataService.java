package com.iktomy.s3lite_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class DataService {

    private final Path storageRoot;

    public DataService(@Value("${s3lite.storage.root:./s3-data}") String storageRootPath) {
        this.storageRoot = Paths.get(storageRootPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create storage root directory: " + storageRoot, e);
        }
    }

    public void store(String bucketName, String objectKey, Long versionId, InputStream inputStream) {
        Path target = resolveFilePath(bucketName, objectKey, versionId);
        try {
            Files.createDirectories(target.getParent());
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error at storing object '" + objectKey + "' in bucket '" + bucketName + "'.", e);
        }
    }

    public Resource loadAsResource(String bucketName, String objectKey, Long versionId) {
        Path filePath = resolveFilePath(bucketName, objectKey, versionId);
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Physical file not found for '" + objectKey + "' (versionId=" + versionId + ").");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Invalid path for object '" + objectKey + "'.", e);
        }
    }

    public void delete(String bucketName, String objectKey, Long versionId) {
        Path filePath = resolveFilePath(bucketName, objectKey, versionId);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error at deleting physical file for object '" + objectKey + "' (versionId=" + versionId + ").", e);
        }
    }

    public void streamTo(String bucketName, String objectKey, Long versionId, OutputStream outputStream) {
        Path filePath = resolveFilePath(bucketName, objectKey, versionId);
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Physical file not found for object '" + objectKey + "' (versionId=" + versionId + ").");
        }
        try {
            Files.copy(filePath, outputStream);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error at transmitting object '" + objectKey + "'.", e);
        }
    }

    private Path resolveFilePath(String bucketName, String objectKey, Long versionId) {
        Path resolved = storageRoot
                .resolve(sanitize(bucketName))
                .resolve(objectKey)
                .resolve(versionId.toString())
                .normalize();

        if (!resolved.startsWith(storageRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid object path: '" + objectKey + "'.");
        }
        return resolved;
    }

    private String sanitize(String segment) {
        if (segment == null || segment.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty path segment.");
        }
        return segment;
    }
}
