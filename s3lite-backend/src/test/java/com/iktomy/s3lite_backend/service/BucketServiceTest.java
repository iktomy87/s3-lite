package com.iktomy.s3lite_backend.service;

import com.iktomy.s3lite.model.BucketResponse;
import com.iktomy.s3lite.model.ObjectListResponse;
import com.iktomy.s3lite_backend.model.Bucket;
import com.iktomy.s3lite_backend.model.ObjectVersion;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.repository.BucketRepository;
import com.iktomy.s3lite_backend.repository.ObjectVersionRepository;
import com.iktomy.s3lite_backend.repository.BucketPermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BucketServiceTest {

    @Mock
    private BucketRepository bucketRepository;

    @Mock
    private ObjectVersionRepository versionRepository;

    @Mock
    private BucketPermissionRepository permissionRepository;

    @InjectMocks
    private BucketService bucketService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setUsername("alice");
    }

    @Test
    void createBucket_success_returnsBucketResponse() {
        when(bucketRepository.existsByName("my-bucket")).thenReturn(false);
        when(bucketRepository.save(any(Bucket.class))).thenAnswer(invocation -> {
            Bucket b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            b.setCreatedAt(OffsetDateTime.now());
            return b;
        });

        BucketResponse response = bucketService.createBucket("my-bucket", owner);

        assertThat(response.getName()).isEqualTo("my-bucket");
        assertThat(response.getOwnerId()).isEqualTo(owner.getId());
        assertThat(response.getId()).isNotNull();
        verify(bucketRepository).save(any(Bucket.class));
    }

    @Test
    void createBucket_duplicateName_throws409() {
        when(bucketRepository.existsByName("my-bucket")).thenReturn(true);

        assertThatThrownBy(() -> bucketService.createBucket("my-bucket", owner))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        verify(bucketRepository, never()).save(any());
    }

    @Test
    void listObjects_allVersionsFalse_callsListLatestActive() {
        when(bucketRepository.existsByName("my-bucket")).thenReturn(true);
        when(versionRepository.listLatestActive("my-bucket", null)).thenReturn(List.of());

        ObjectListResponse response = bucketService.listObjects("my-bucket", null, false);

        assertThat(response.getBucketName()).isEqualTo("my-bucket");
        verify(versionRepository).listLatestActive("my-bucket", null);
        verify(versionRepository, never()).listAllVersions(any(), any());
    }

    @Test
    void listObjects_allVersionsTrue_callsListAllVersions() {
        when(bucketRepository.existsByName("my-bucket")).thenReturn(true);
        ObjectVersion ov = buildObjectVersion("img.jpg", 1L);
        when(versionRepository.listAllVersions("my-bucket", "img")).thenReturn(List.of(ov));

        ObjectListResponse response = bucketService.listObjects("my-bucket", "img", true);

        assertThat(response.getObjects()).hasSize(1);
        assertThat(response.getObjects().get(0).getKey()).isEqualTo("img.jpg");
        verify(versionRepository).listAllVersions("my-bucket", "img");
        verify(versionRepository, never()).listLatestActive(any(), any());
    }

    @Test
    void listObjects_bucketNotFound_throws404() {
        when(bucketRepository.existsByName("ghost")).thenReturn(false);

        assertThatThrownBy(() -> bucketService.listObjects("ghost", null, false))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    private ObjectVersion buildObjectVersion(String key, Long versionId) {
        Bucket bucket = new Bucket();
        bucket.setId(UUID.randomUUID());
        bucket.setName("my-bucket");
        bucket.setOwnerId(owner.getId());

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
