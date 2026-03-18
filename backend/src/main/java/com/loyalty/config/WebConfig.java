package com.loyalty.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String path = uploadDir;

        // 🔥 Normalizar path (clave para Windows y VPS)
        if (!path.endsWith("/")) {
            path = path + "/";
        }

        path = path.replace("\\", "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + path)
                .setCachePeriod(3600);
    }
}
