-- ============================================================
-- V6 — Fondo personalizado e iconos del negocio
-- background_url: URL externa o archivo gestionado (/api/files/backgrounds/...)
-- stamp_icon / reward_icon: emoji elegido por el negocio
-- ============================================================

ALTER TABLE businesses
    ADD COLUMN background_url VARCHAR(500) NULL AFTER logo_url,
    ADD COLUMN stamp_icon VARCHAR(16) NULL AFTER color_secondary,
    ADD COLUMN reward_icon VARCHAR(16) NULL AFTER stamp_icon;
