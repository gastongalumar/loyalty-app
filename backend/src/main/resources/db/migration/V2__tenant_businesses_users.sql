-- ============================================================
-- V2 — businesses como tabla tenant + identidad de usuario por tenant
-- Todo nullable en esta fase: el backfill corre en V4.
-- ============================================================

ALTER TABLE businesses
    ADD COLUMN slug VARCHAR(80) NULL AFTER name,
    ADD COLUMN color_primary VARCHAR(7) NULL AFTER logo_url,
    ADD COLUMN color_secondary VARCHAR(7) NULL AFTER color_primary,
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' AFTER reward_description,
    ADD COLUMN deleted_at DATETIME NULL AFTER created_at;

-- TEXT -> VARCHAR: Hibernate validate espera un tipo VARCHAR para String
ALTER TABLE businesses MODIFY COLUMN description VARCHAR(1000) NULL;

ALTER TABLE businesses MODIFY COLUMN owner_id BIGINT NULL;

ALTER TABLE businesses DROP FOREIGN KEY fk_business_owner;
ALTER TABLE businesses
    ADD CONSTRAINT fk_business_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE businesses ADD INDEX idx_businesses_status (status);

-- users: tenant_id + clave generada para que el UNIQUE cubra también tenant_id NULL
ALTER TABLE users ADD COLUMN tenant_id BIGINT NULL AFTER id;

ALTER TABLE users
    ADD COLUMN tenant_key BIGINT GENERATED ALWAYS AS (IFNULL(tenant_id, 0)) STORED AFTER tenant_id;

ALTER TABLE users DROP INDEX email;
ALTER TABLE users ADD UNIQUE KEY uk_users_tenant_email (tenant_key, email);

ALTER TABLE users DROP INDEX phone;
ALTER TABLE users ADD UNIQUE KEY uk_users_tenant_phone (tenant_key, phone);

-- ENUM -> VARCHAR: evita dos rebuilds y permite CHECK explícito
ALTER TABLE users MODIFY COLUMN role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER';

ALTER TABLE users ADD INDEX idx_users_tenant_role (tenant_id, role);

ALTER TABLE users
    ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE RESTRICT;
