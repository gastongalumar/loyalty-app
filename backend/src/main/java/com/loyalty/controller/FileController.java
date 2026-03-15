package com.loyalty.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/{type}/{filename}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String type,
            @PathVariable String filename) {

        try {
            // Construir la ruta completa del archivo
            Path filePath = Paths.get(uploadDir, type, filename);
            Resource resource = new UrlResource(filePath.toUri());

            // Verificar si el archivo existe y es legible
            if (resource.exists() && resource.isReadable()) {

                // Determinar el tipo de contenido basado en la extensión
                String contentType = "application/octet-stream";
                String lowerFilename = filename.toLowerCase();

                if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (lowerFilename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lowerFilename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (lowerFilename.endsWith(".svg")) {
                    contentType = "image/svg+xml";
                } else if (lowerFilename.endsWith(".webp")) {
                    contentType = "image/webp";
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
