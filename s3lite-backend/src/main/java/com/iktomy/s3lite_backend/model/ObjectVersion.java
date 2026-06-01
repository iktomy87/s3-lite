package com.iktomy.s3lite_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

// RF-02, RF-03, RF-04, RF-06.

@Entity
@Table(name = "object_versions", indexes = {
        @Index(name = "idx_obj_bucket_key_latest", columnList = "bucket_id, object_key, is_latest"),
        @Index(name = "idx_obj_bucket_key_version", columnList = "bucket_id, object_key, version_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class ObjectVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bucket_id", nullable = false)
    private Bucket bucket;

    @Column(name = "object_key", nullable = false, length = 1024)
    private String key;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "size_in_bytes", nullable = false)
    private Long sizeInBytes;

    @Column(name = "mime_type", nullable = false, length = 128)
    private String mimeType;

    @Column(name = "is_latest", nullable = false)
    private boolean isLatest;

    @Column(nullable = false)
    private boolean deleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
