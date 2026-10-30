package com.loyalty.service;

import com.loyalty.exception.InvalidRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService service;

    @BeforeEach
    void setUp() {
        service = new FileStorageService();
        ReflectionTestUtils.setField(service, "uploadDir", tempDir.toString());
    }

    @Test
    void storesPngAndReturnsManagedUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "fondo.png", "image/png", new byte[]{1, 2, 3});

        String url = service.storeBackground(file);

        assertThat(url).startsWith("/api/files/backgrounds/").endsWith(".png");
        String filename = url.substring("/api/files/backgrounds/".length());
        assertThat(Files.exists(tempDir.resolve("backgrounds").resolve(filename))).isTrue();
    }

    @Test
    void rejectsNonImageContent() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "nota.txt", "text/plain", "hola".getBytes());

        assertThatThrownBy(() -> service.storeBackground(file))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("JPG");
    }

    @Test
    void storesLogoInItsOwnFolder() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", new byte[]{1});

        String url = service.storeLogo(file);

        assertThat(url).startsWith("/api/files/logos/").endsWith(".png");
    }

    @Test
    void deletesOnlyManagedFiles() throws Exception {
        Path directory = Files.createDirectories(tempDir.resolve("backgrounds"));
        Path stored = Files.write(directory.resolve("photo.png"), new byte[]{1});

        service.deleteManaged("/api/files/backgrounds/photo.png");
        service.deleteManaged("https://cdn.example.com/photo.png");

        assertThat(Files.exists(stored)).isFalse();
    }
}
