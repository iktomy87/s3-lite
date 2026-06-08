package com.iktomy.s3lite_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.iktomy.s3lite_backend.model.ObjectVersion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ObjectVersionRepository extends JpaRepository<ObjectVersion, UUID> {

        @Query("""
                        SELECT ov FROM ObjectVersion ov
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        AND ov.isLatest    = true
                        AND ov.deleted     = false
                        """)
        Optional<ObjectVersion> findLatestActive(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey);

        @Query("""
                        SELECT ov FROM ObjectVersion ov
                        WHERE ov.bucket.name = :bucketName
                        AND ov.isLatest      = true
                        AND ov.deleted       = false
                        AND (:prefix IS NULL OR ov.key LIKE :prefix%)
                        ORDER BY ov.key ASC
                        """)
        List<ObjectVersion> listLatestActive(
                        @Param("bucketName") String bucketName,
                        @Param("prefix") String prefix);

        @Query("""
                        SELECT ov FROM ObjectVersion ov
                        WHERE ov.bucket.name = :bucketName
                        AND (:prefix IS NULL OR ov.key LIKE :prefix%)
                        ORDER BY ov.key ASC, ov.versionId ASC
                        """)
        List<ObjectVersion> listAllVersions(
                        @Param("bucketName") String bucketName,
                        @Param("prefix") String prefix);

        @Query("""
                        SELECT ov FROM ObjectVersion ov
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        AND ov.versionId   = :versionId
                        """)
        Optional<ObjectVersion> findByBucketNameAndKeyAndVersionId(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey,
                        @Param("versionId") Long versionId);

        @Query("""
                        SELECT COALESCE(MAX(ov.versionId), 0)
                        FROM ObjectVersion ov
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        """)
        Long findMaxVersionId(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey);

        @Modifying
        @Query("""
                        UPDATE ObjectVersion ov
                        SET ov.isLatest = false
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        AND ov.isLatest    = true
                        """)
        void demoteLatest(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey);

        @Modifying
        @Query("""
                        UPDATE ObjectVersion ov
                        SET ov.deleted = true
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        AND ov.isLatest    = true
                        AND ov.deleted     = false
                        """)
        int softDeleteLatest(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey);

        @Modifying
        @Query("""
                        UPDATE ObjectVersion ov
                        SET ov.deleted = true
                        WHERE ov.bucket.name = :bucketName
                        AND ov.key         = :objectKey
                        AND ov.versionId   = :versionId
                        AND ov.deleted     = false
                        """)
        int softDeleteByVersion(
                        @Param("bucketName") String bucketName,
                        @Param("objectKey") String objectKey,
                        @Param("versionId") Long versionId);
}
