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

    public String storeFile(MultipartFile file, String subfolder) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            extension = ".png";
        }

        String filename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 👇 ESTO ES LO CORRECTO - USA /uploads/ QUE SPRING SIRVE CON static-locations
        return "/uploads/" + subfolder + "/" + filename;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String subfolder = "";
            if (fileUrl.contains("/logos/")) {
                subfolder = "logos";
            } else if (fileUrl.contains("/backgrounds/")) {
                subfolder = "backgrounds";
            } else if (fileUrl.contains("/avatars/")) {
                subfolder = "avatars";
            }

            Path filePath = Paths.get(uploadDir, subfolder, filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}
