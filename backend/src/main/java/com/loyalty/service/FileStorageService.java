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
import java.util.Set;
import java.util.UUID;

/**
 * Guarda imágenes en disco y devuelve una URL pública servida por
 * {@code /api/files/{tipo}/{archivo}}. Las URLs externas se respetan tal cual.
 */
@Service
public class FileStorageService {

    private static final String FILES_PREFIX = "/api/files/";
    private static final Set<String> ALLOWED_FOLDERS = Set.of("backgrounds", "logos");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    @Value("${app.uploads.dir:uploads}")
    private String uploadDir;

    public String storeBackground(MultipartFile file) {
        return storeImage(file, "backgrounds");
    }

    public String storeLogo(MultipartFile file) {
        return storeImage(file, "logos");
    }

    public String storeImage(MultipartFile file, String folder) {
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new InvalidRequestException("invalid_folder", "Unknown image folder");
        }
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("image_required", "Choose an image file");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new InvalidRequestException("image_too_large", "Image must be 5 MB or smaller");
        }

        String extension = EXTENSIONS.get(file.getContentType());
        if (extension == null) {
            throw new InvalidRequestException("image_type", "Image must be JPG, PNG or WebP");
        }

        String filename = UUID.randomUUID() + extension;
        Path directory = directory(folder);

        try {
            Files.createDirectories(directory);
            try (var input = file.getInputStream()) {
                Files.copy(input, directory.resolve(filename));
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store image", ex);
        }

        return FILES_PREFIX + folder + "/" + filename;
    }

    /** Borra solo archivos propios; una URL externa nunca se toca. */
    public void deleteManaged(String url) {
        if (url == null || !url.startsWith(FILES_PREFIX)) {
            return;
        }
        String rest = url.substring(FILES_PREFIX.length());
        String[] parts = rest.split("/", 2);
        if (parts.length != 2 || !ALLOWED_FOLDERS.contains(parts[0])) {
            return;
        }
        String folder = parts[0];
        String filename = parts[1];
        if (!filename.matches("[A-Za-z0-9._-]+")) {
            return;
        }
        try {
            Files.deleteIfExists(directory(folder).resolve(filename));
        } catch (IOException ignored) {
            // La imagen ya no está disponible; no bloquea el guardado.
        }
    }

    private Path directory(String folder) {
        return Paths.get(uploadDir, folder).toAbsolutePath().normalize();
    }
}
