package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite.model.ObjectMetadata;
import com.iktomy.s3lite_backend.model.Bucket;
import com.iktomy.s3lite_backend.model.ObjectVersion;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.ObjectVersionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@Service
@Transactional(readOnly = true)
public class MetadataService {

    private final ObjectVersionRepository versionRepo;
    private final BucketRepository bucketRepo;

    public MetadataService(ObjectVersionRepository versionRepo,
            BucketRepository bucketRepo) {
        this.versionRepo = versionRepo;
        this.bucketRepo = bucketRepo;
    }

    // Lectura de metadatos (RF-03 / RF-06)

    public ObjectMetadata getMetadata(String bucketName, String objectKey, Long versionId) {
        ObjectVersion entity = (versionId == null)
                ? findLatestOrThrow(bucketName, objectKey)
                : findVersionOrThrow(bucketName, objectKey, versionId);

        return toApiModel(entity);
    }

    // Registro de nueva versión (RF-02 / RF-06)

    @Transactional
    public ObjectMetadata registerNewVersion(String bucketName,
            String objectKey,
            long sizeInBytes,
            String mimeType) {
        Bucket bucket = bucketRepo.findByName(bucketName)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Bucket '" + bucketName + "' not found."));

        long nextVersion = versionRepo.findMaxVersionId(bucketName, objectKey) + 1;

        versionRepo.demoteLatest(bucketName, objectKey);

        ObjectVersion entity = new ObjectVersion();
        entity.setBucket(bucket);
        entity.setKey(objectKey);
        entity.setVersionId(nextVersion);
        entity.setSizeInBytes(sizeInBytes);
        entity.setMimeType(mimeType);
        entity.setLatest(true);
        entity.setDeleted(false);
        entity.setCreatedAt(OffsetDateTime.now());

        versionRepo.save(entity);

        return toApiModel(entity);
    }

    // Soft-delete (RF-04)

    @Transactional
    public void softDeleteSpecificVersion(String bucketName, String objectKey, Long versionId) {
        int updated = versionRepo.softDeleteByVersion(bucketName, objectKey, versionId);
        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Object '" + objectKey + "' (versionId=" + versionId +
                            ") not found in bucket '" + bucketName + "'.");
        }
    }

    @Transactional
    public void softDeleteLatestVersion(String bucketName, String objectKey) {
        int updated = versionRepo.softDeleteLatest(bucketName, objectKey);
        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Object '" + objectKey + "' not found in bucket '" + bucketName + "'.");
        }
    }

    private ObjectVersion findLatestOrThrow(String bucketName, String objectKey) {
        return versionRepo.findLatestActive(bucketName, objectKey)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Object '" + objectKey + "' not found in bucket '" + bucketName + "'."));
    }

    private ObjectVersion findVersionOrThrow(String bucketName,
            String objectKey,
            Long versionId) {
        ObjectVersion entity = versionRepo
                .findByBucketNameAndKeyAndVersionId(bucketName, objectKey, versionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Object '" + objectKey + "' (versionId=" + versionId +
                                ") not found in bucket '" + bucketName + "'."));

        if (entity.isDeleted()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Object '" + objectKey + "' (versionId=" + versionId +
                            ") has been deleted from bucket '" + bucketName + "'.");
        }
        return entity;
    }

    private ObjectMetadata toApiModel(ObjectVersion entity) {
        return new ObjectMetadata(
                entity.getId(),
                entity.getBucket().getId(),
                entity.getKey(),
                entity.getVersionId(),
                entity.getSizeInBytes(),
                entity.getMimeType(),
                entity.isLatest(),
                entity.isDeleted(),
                entity.getCreatedAt());
    }
}
