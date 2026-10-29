-- ============================================================
-- V4 — Backfill multi-tenant (modo portfolio: sin datos a preservar)
--
-- Si la base tuviera datos reales, este archivo debe reemplazarse por la
-- versión completa del PLAN.md §4 (tenant 'legacy', normalización de
-- redeemed_at y verificación de huérfanos). Ver TODO-01.
-- Los UPDATE son idempotentes y no crean filas.
-- ============================================================

-- 1. Rol heredado
UPDATE users SET role = 'BUSINESS_ADMIN' WHERE role = 'BUSINESS_OWNER';

-- 2. Slug derivado del nombre + id (garantiza unicidad sin coordinación)
UPDATE businesses
SET slug = CONCAT(
        REGEXP_REPLACE(REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-'), '(^-+|-+$)', ''),
        '-', id)
WHERE slug IS NULL OR slug = '';

-- 3. Admins heredados: el tenant es el negocio que los tenía como owner
UPDATE users u
    JOIN businesses b ON b.owner_id = u.id
SET u.tenant_id = b.id
WHERE u.role = 'BUSINESS_ADMIN'
  AND u.tenant_id IS NULL;

-- 4. Customers: el tenant es el negocio de su tarjeta
UPDATE users u
    JOIN loyalty_cards c ON c.user_id = u.id
SET u.tenant_id = c.business_id
WHERE u.role = 'CUSTOMER'
  AND u.tenant_id IS NULL;

-- 5. Hijos: tenant_id = business_id / tenant de la tarjeta
UPDATE loyalty_cards SET tenant_id = business_id WHERE tenant_id IS NULL;

UPDATE stamps s
    JOIN loyalty_cards c ON c.id = s.loyalty_card_id
SET s.tenant_id = c.tenant_id
WHERE s.tenant_id IS NULL;

UPDATE rewards r
    JOIN loyalty_cards c ON c.id = r.loyalty_card_id
SET r.tenant_id = c.tenant_id
WHERE r.tenant_id IS NULL;
