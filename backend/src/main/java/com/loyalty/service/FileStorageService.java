package com.loyalty.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Guarda un archivo en el servidor
     * @param file El archivo a guardar
     * @param subfolder Subcarpeta (logos o backgrounds)
     * @return La URL pública del archivo
     * @throws IOException Si hay error al guardar
     */
    public String storeFile(MultipartFile file, String subfolder) throws IOException {
        // Crear el directorio si no existe
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para evitar conflictos
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            extension = ".png"; // default
        }

        String filename = UUID.randomUUID().toString() + extension;

        // Guardar el archivo
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar la URL pública (relativa)
        return "/uploads/" + subfolder + "/" + filename;
    }

    /**
     * Elimina un archivo del servidor
     * @param fileUrl La URL del archivo a eliminar
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            // Extraer nombre del archivo de la URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String subfolder = fileUrl.contains("/logos/") ? "logos" : "backgrounds";

            Path filePath = Paths.get(uploadDir, subfolder, filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Solo loguear, no interrumpir flujo
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}
