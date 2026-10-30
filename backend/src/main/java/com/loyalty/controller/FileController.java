package com.loyalty.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Sirve las imágenes subidas (fondos y logos). Es público porque el branding
 * también se muestra en login y landing antes de autenticarse.
 */
@RestController
public class FileController {

    private static final Set<String> TYPES = Set.of("backgrounds", "logos");

    @Value("${app.uploads.dir:uploads}")
    private String uploadDir;

    @GetMapping("/api/files/{type}/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String type,
                                            @PathVariable String filename) {
        if (!TYPES.contains(type) || !filename.matches("[A-Za-z0-9._-]+")) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path base = Paths.get(uploadDir, type).toAbsolutePath().normalize();
            Path filePath = base.resolve(filename).normalize();
            if (!filePath.startsWith(base)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                    .contentType(mediaType(filename))
                    .body(resource);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private MediaType mediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.IMAGE_JPEG;
    }
}
