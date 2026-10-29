-- ============================================================
-- V5 — Constraints finales multi-tenant
-- Falla a propósito si V4 dejó filas inconsistentes.
-- ============================================================

-- businesses
ALTER TABLE businesses MODIFY COLUMN slug VARCHAR(80) NOT NULL;
ALTER TABLE businesses ADD UNIQUE KEY uk_businesses_slug (slug);
ALTER TABLE businesses
    ADD CONSTRAINT ck_businesses_slug CHECK (slug REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$');

-- users: PLATFORM_ADMIN <=> tenant_id NULL
ALTER TABLE users
    ADD CONSTRAINT ck_users_tenant_role CHECK (
        (role = 'PLATFORM_ADMIN' AND tenant_id IS NULL)
        OR (role IN ('BUSINESS_ADMIN', 'CUSTOMER') AND tenant_id IS NOT NULL)
    );

-- ENUM -> VARCHAR (Hibernate validate espera varchar y permite nuevos estados)
ALTER TABLE loyalty_cards MODIFY COLUMN status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE rewards MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE';

-- loyalty_cards
ALTER TABLE loyalty_cards MODIFY COLUMN tenant_id BIGINT NOT NULL;
ALTER TABLE loyalty_cards DROP INDEX user_id;
ALTER TABLE loyalty_cards ADD UNIQUE KEY uk_cards_tenant_user (tenant_id, user_id);
ALTER TABLE loyalty_cards
    ADD CONSTRAINT ck_cards_tenant_business CHECK (tenant_id = business_id);

-- stamps: FK compuesta (card + tenant)
ALTER TABLE stamps MODIFY COLUMN tenant_id BIGINT NOT NULL;
ALTER TABLE stamps DROP FOREIGN KEY fk_stamp_card;
ALTER TABLE stamps
    ADD CONSTRAINT fk_stamp_card_tenant FOREIGN KEY (loyalty_card_id, tenant_id)
        REFERENCES loyalty_cards (id, tenant_id) ON DELETE CASCADE;

-- rewards: FK compuesta (card + tenant)
ALTER TABLE rewards MODIFY COLUMN tenant_id BIGINT NOT NULL;
ALTER TABLE rewards DROP FOREIGN KEY fk_reward_card;
ALTER TABLE rewards
    ADD CONSTRAINT fk_reward_card_tenant FOREIGN KEY (loyalty_card_id, tenant_id)
        REFERENCES loyalty_cards (id, tenant_id) ON DELETE CASCADE;
