-- ============================================================
-- V3 — tenant_id redundante en hijos + auditoría de canje
-- Nullable todavía: V4 hace el backfill.
-- ============================================================

ALTER TABLE loyalty_cards
    ADD COLUMN tenant_id BIGINT NULL AFTER id,
    ADD UNIQUE KEY uk_cards_id_tenant (id, tenant_id),
    ADD INDEX idx_cards_tenant_business (tenant_id, business_id, status);

ALTER TABLE stamps
    ADD COLUMN tenant_id BIGINT NULL AFTER id,
    ADD INDEX idx_stamps_tenant_created (tenant_id, created_at);

ALTER TABLE rewards
    ADD COLUMN tenant_id BIGINT NULL AFTER id,
    ADD COLUMN redeemed_by_id BIGINT NULL AFTER redeemed_at,
    ADD INDEX idx_rewards_tenant_status (tenant_id, status);

ALTER TABLE rewards
    ADD CONSTRAINT fk_reward_redeemed_by FOREIGN KEY (redeemed_by_id) REFERENCES users(id) ON DELETE SET NULL;
