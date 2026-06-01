package com.iktomy.s3lite_backend.controllers;

import org.springframework.http.HttpHeaders;
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
    // TO DO: crear los servicios para resolver los errores de importancion
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
