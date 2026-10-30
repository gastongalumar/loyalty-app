-- ============================================================
-- V7 — Ajustes de lectura del fondo (glassmorphism)
-- background_visibility: 0 (oculto) .. 100 (muy visible)
-- background_blur: 0 .. 24 px aplicado a las superficies de vidrio
-- ============================================================

ALTER TABLE businesses
    ADD COLUMN background_visibility INT NULL AFTER background_url,
    ADD COLUMN background_blur INT NULL AFTER background_visibility;
