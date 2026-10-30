-- ============================================================
-- V8 — Branding global de la plataforma (fila única id=1)
-- Aplica a landing, login de plataforma y panel maestro.
-- ============================================================

CREATE TABLE platform_settings (
    id BIGINT NOT NULL,
    app_name VARCHAR(120) NOT NULL,
    tagline VARCHAR(200) NULL,
    logo_url VARCHAR(500) NULL,
    background_url VARCHAR(500) NULL,
    background_visibility INT NULL,
    background_blur INT NULL,
    color_primary VARCHAR(7) NULL,
    color_secondary VARCHAR(7) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id)
);

INSERT INTO platform_settings (id, app_name, background_visibility, background_blur)
VALUES (1, 'Loyalty Card', 20, 8);
