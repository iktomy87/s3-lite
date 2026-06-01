package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite.model.BucketResponse;
import com.iktomy.s3lite.model.ObjectListResponse;
import com.iktomy.s3lite.model.ObjectSummary;
import com.iktomy.s3lite_backend.model.Bucket;
import com.iktomy.s3lite_backend.model.ObjectVersion;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.ObjectVersionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BucketService {

    private final BucketRepository bucketRepository;
    private final ObjectVersionRepository versionRepository;

    public BucketService(BucketRepository bucketRepository,
            ObjectVersionRepository versionRepository) {
        this.bucketRepository = bucketRepository;
        this.versionRepository = versionRepository;
    }

    @Transactional
    public BucketResponse createBucket(String bucketName, User owner) {
        if (bucketRepository.existsByName(bucketName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bucket '" + bucketName + "' already exists.");
        }

        Bucket bucket = new Bucket();
        bucket.setName(bucketName);
        bucket.setOwnerId(owner.getId());
        bucketRepository.save(bucket);

        return new BucketResponse(bucket.getId(), bucket.getName(), bucket.getOwnerId(), bucket.getCreatedAt());
    }

    public ObjectListResponse listObjects(String bucketName, String prefix, boolean allVersions) {
        if (!bucketRepository.existsByName(bucketName)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Bucket '" + bucketName + "' not found.");
        }

        List<ObjectVersion> versions = allVersions
                ? versionRepository.listAllVersions(bucketName, prefix)
                : versionRepository.listLatestActive(bucketName, prefix);

        List<ObjectSummary> summaries = versions.stream()
                .map(ov -> new ObjectSummary(
                        ov.getKey(),
                        ov.getVersionId(),
                        ov.getSizeInBytes(),
                        ov.getMimeType(),
                        ov.isLatest(),
                        ov.isDeleted(),
                        ov.getCreatedAt()))
                .toList();

        return new ObjectListResponse(bucketName, summaries);
    }
}
