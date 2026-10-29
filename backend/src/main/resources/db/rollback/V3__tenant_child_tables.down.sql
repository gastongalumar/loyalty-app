-- Rollback manual de V3.
ALTER TABLE rewards DROP FOREIGN KEY fk_reward_redeemed_by;
ALTER TABLE rewards DROP INDEX idx_rewards_tenant_status;
ALTER TABLE rewards DROP COLUMN redeemed_by_id;
ALTER TABLE rewards DROP COLUMN tenant_id;

ALTER TABLE stamps DROP INDEX idx_stamps_tenant_created;
ALTER TABLE stamps DROP COLUMN tenant_id;

ALTER TABLE loyalty_cards DROP INDEX idx_cards_tenant_business;
ALTER TABLE loyalty_cards DROP INDEX uk_cards_id_tenant;
ALTER TABLE loyalty_cards DROP COLUMN tenant_id;
