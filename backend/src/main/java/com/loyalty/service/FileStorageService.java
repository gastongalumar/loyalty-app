package com.loyalty.service;

import com.loyalty.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

/**
 * Guarda las imágenes de fondo en disco y devuelve una URL pública servida por
 * {@code /api/files/backgrounds/...}. Las URLs externas se respetan tal cual.
 */
@Service
public class FileStorageService {

    private static final String BACKGROUND_PREFIX = "/api/files/backgrounds/";
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    @Value("${app.uploads.dir:uploads}")
    private String uploadDir;

    public String storeBackground(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("background_required", "Choose an image file");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new InvalidRequestException("background_too_large", "Image must be 5 MB or smaller");
        }

        String extension = EXTENSIONS.get(file.getContentType());
        if (extension == null) {
            throw new InvalidRequestException("background_type", "Image must be JPG, PNG or WebP");
        }

        String filename = UUID.randomUUID() + extension;
        Path directory = backgroundDirectory();

        try {
            Files.createDirectories(directory);
            try (var input = file.getInputStream()) {
                Files.copy(input, directory.resolve(filename));
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store background image", ex);
        }

        return BACKGROUND_PREFIX + filename;
    }

    /** Borra solo archivos propios; una URL externa nunca se toca. */
    public void deleteManaged(String url) {
        if (url == null || !url.startsWith(BACKGROUND_PREFIX)) {
            return;
        }
        String filename = url.substring(BACKGROUND_PREFIX.length());
        if (!filename.matches("[A-Za-z0-9._-]+")) {
            return;
        }
        try {
            Files.deleteIfExists(backgroundDirectory().resolve(filename));
        } catch (IOException ignored) {
            // La imagen ya no está disponible; no bloquea el guardado del negocio.
        }
    }

    private Path backgroundDirectory() {
        return Paths.get(uploadDir, "backgrounds").toAbsolutePath().normalize();
    }
}
