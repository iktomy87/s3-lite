package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite.model.ObjectMetadata;
import com.iktomy.s3lite_backend.model.Bucket;
import com.iktomy.s3lite_backend.model.ObjectVersion;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.ObjectVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MetadataServiceTest {

    @Mock
    private ObjectVersionRepository versionRepo;

    @Mock
    private BucketRepository bucketRepo;

    @InjectMocks
    private MetadataService metadataService;

    private Bucket bucket;

    @BeforeEach
    void setUp() {
        bucket = new Bucket();
        bucket.setId(UUID.randomUUID());
        bucket.setName("ci-artifacts");
        bucket.setOwnerId(UUID.randomUUID());
        bucket.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    void registerNewVersion_firstVersion_versionIdIsOne() {
        when(bucketRepo.findByName("ci-artifacts")).thenReturn(Optional.of(bucket));
        when(versionRepo.findMaxVersionId("ci-artifacts", "report.pdf")).thenReturn(0L);
        when(versionRepo.save(any(ObjectVersion.class))).thenAnswer(i -> i.getArgument(0));

        ObjectMetadata result = metadataService.registerNewVersion(
                "ci-artifacts", "report.pdf", 2048L, "application/pdf");

        assertThat(result.getVersionId()).isEqualTo(1L);
        assertThat(result.getKey()).isEqualTo("report.pdf");
        assertThat(result.getMimeType()).isEqualTo("application/pdf");
    }

    @Test
    void registerNewVersion_secondUpload_versionIdIncrements() {
        when(bucketRepo.findByName("ci-artifacts")).thenReturn(Optional.of(bucket));
        when(versionRepo.findMaxVersionId("ci-artifacts", "report.pdf")).thenReturn(1L);
        when(versionRepo.save(any(ObjectVersion.class))).thenAnswer(i -> i.getArgument(0));

        ObjectMetadata result = metadataService.registerNewVersion(
                "ci-artifacts", "report.pdf", 3000L, "application/pdf");

        assertThat(result.getVersionId()).isEqualTo(2L);
    }

    @Test
    void registerNewVersion_demoteLatestCalledBeforeSave() {
        when(bucketRepo.findByName("ci-artifacts")).thenReturn(Optional.of(bucket));
        when(versionRepo.findMaxVersionId("ci-artifacts", "img.jpg")).thenReturn(0L);
        when(versionRepo.save(any(ObjectVersion.class))).thenAnswer(i -> i.getArgument(0));

        metadataService.registerNewVersion("ci-artifacts", "img.jpg", 1024L, "image/jpeg");

        var inOrder = inOrder(versionRepo);
        inOrder.verify(versionRepo).demoteLatest("ci-artifacts", "img.jpg");
        inOrder.verify(versionRepo).save(any(ObjectVersion.class));
    }

    @Test
    void registerNewVersion_bucketNotFound_throws404() {
        when(bucketRepo.findByName("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                metadataService.registerNewVersion("unknown", "file.txt", 100L, "text/plain"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void softDeleteLatestVersion_nothingDeleted_throws404() {
        when(versionRepo.softDeleteLatest("ci-artifacts", "ghost.txt")).thenReturn(0);

        assertThatThrownBy(() ->
                metadataService.softDeleteLatestVersion("ci-artifacts", "ghost.txt"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void softDeleteLatestVersion_deleted_noException() {
        when(versionRepo.softDeleteLatest("ci-artifacts", "img.jpg")).thenReturn(1);

        metadataService.softDeleteLatestVersion("ci-artifacts", "img.jpg");
    }

    @Test
    void softDeleteSpecificVersion_nothingDeleted_throws404() {
        when(versionRepo.softDeleteByVersion("ci-artifacts", "img.jpg", 3L)).thenReturn(0);

        assertThatThrownBy(() ->
                metadataService.softDeleteSpecificVersion("ci-artifacts", "img.jpg", 3L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void getMetadata_noVersionId_resolvesLatest() {
        ObjectVersion ov = buildObjectVersion("img.jpg", 2L);
        when(versionRepo.findLatestActive("ci-artifacts", "img.jpg")).thenReturn(Optional.of(ov));

        ObjectMetadata result = metadataService.getMetadata("ci-artifacts", "img.jpg", null);

        assertThat(result.getVersionId()).isEqualTo(2L);
        verify(versionRepo).findLatestActive("ci-artifacts", "img.jpg");
        verify(versionRepo, never()).findByBucketNameAndKeyAndVersionId(any(), any(), any());
    }

    @Test
    void getMetadata_withVersionId_resolvesSpecificVersion() {
        ObjectVersion ov = buildObjectVersion("img.jpg", 1L);
        when(versionRepo.findByBucketNameAndKeyAndVersionId("ci-artifacts", "img.jpg", 1L))
                .thenReturn(Optional.of(ov));

        ObjectMetadata result = metadataService.getMetadata("ci-artifacts", "img.jpg", 1L);

        assertThat(result.getVersionId()).isEqualTo(1L);
        verify(versionRepo, never()).findLatestActive(any(), any());
    }

    private ObjectVersion buildObjectVersion(String key, Long versionId) {
        ObjectVersion ov = new ObjectVersion();
        ov.setId(UUID.randomUUID());
        ov.setBucket(bucket);
        ov.setKey(key);
        ov.setVersionId(versionId);
        ov.setSizeInBytes(1024L);
        ov.setMimeType("image/jpeg");
        ov.setLatest(true);
        ov.setDeleted(false);
        ov.setCreatedAt(OffsetDateTime.now());
        return ov;
    }
}
