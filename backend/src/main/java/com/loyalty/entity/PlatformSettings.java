package com.loyalty.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Configuración global de la plataforma (fila única id=1). No pertenece a ningún
 * tenant: aplica a landing, login de plataforma y panel maestro.
 */
@Entity
@Table(name = "platform_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformSettings {

    @Id
    private Long id;

    @Column(nullable = false, length = 120)
    private String appName;

    @Column(length = 200)
    private String tagline;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String backgroundUrl;

    private Integer backgroundVisibility;

    private Integer backgroundBlur;

    @Column(length = 7)
    private String colorPrimary;

    @Column(length = 7)
    private String colorSecondary;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
