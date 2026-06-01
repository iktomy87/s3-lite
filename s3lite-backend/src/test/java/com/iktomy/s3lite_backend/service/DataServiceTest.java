package com.iktomy.s3lite_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DataServiceTest {

    @TempDir
    Path tempDir;

    private DataService dataService;

    @BeforeEach
    void setUp() {
        dataService = new DataService(tempDir.toString());
    }

    @Test
    void store_writesFileUnderStorageRoot() throws IOException {
        byte[] content = "hello s3-lite".getBytes();

        dataService.store("my-bucket", "docs/readme.txt", 1L,
                new ByteArrayInputStream(content));

        Path expected = tempDir.resolve("my-bucket").resolve("docs/readme.txt").resolve("1");
        assertThat(Files.exists(expected)).isTrue();
        assertThat(Files.readAllBytes(expected)).isEqualTo(content);
    }

    @Test
    void loadAsResource_existingFile_returnsReadableResource() throws IOException {
        byte[] content = "file content".getBytes();
        dataService.store("my-bucket", "img.jpg", 2L, new ByteArrayInputStream(content));

        Resource resource = dataService.loadAsResource("my-bucket", "img.jpg", 2L);

        assertThat(resource.exists()).isTrue();
        assertThat(resource.isReadable()).isTrue();
        assertThat(resource.getContentAsByteArray()).isEqualTo(content);
    }

    @Test
    void loadAsResource_missingFile_throws404() {
        assertThatThrownBy(() -> dataService.loadAsResource("my-bucket", "missing.txt", 1L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void store_pathTraversalInObjectKey_throws400() {
        assertThatThrownBy(() ->
                dataService.store("my-bucket", "../../escape.txt", 1L,
                        new ByteArrayInputStream("bad".getBytes())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void store_pathTraversalInBucketName_throws400() {
        assertThatThrownBy(() ->
                dataService.store("../escape", "file.txt", 1L,
                        new ByteArrayInputStream("bad".getBytes())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void loadAsResource_pathTraversal_throws400() {
        assertThatThrownBy(() ->
                dataService.loadAsResource("my-bucket", "../../../etc/passwd", 1L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void delete_existingFile_removesIt() throws IOException {
        dataService.store("my-bucket", "to-delete.txt", 1L,
                new ByteArrayInputStream("bye".getBytes()));
        Path target = tempDir.resolve("my-bucket").resolve("to-delete.txt").resolve("1");
        assertThat(Files.exists(target)).isTrue();

        dataService.delete("my-bucket", "to-delete.txt", 1L);

        assertThat(Files.exists(target)).isFalse();
    }

    @Test
    void delete_missingFile_doesNotThrow() {
        dataService.delete("my-bucket", "nonexistent.txt", 99L);
    }
}
