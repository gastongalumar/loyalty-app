-- Rollback manual de V5.
ALTER TABLE rewards DROP FOREIGN KEY fk_reward_card_tenant;
ALTER TABLE rewards
    ADD CONSTRAINT fk_reward_card FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE;
ALTER TABLE rewards MODIFY COLUMN tenant_id BIGINT NULL;

ALTER TABLE stamps DROP FOREIGN KEY fk_stamp_card_tenant;
ALTER TABLE stamps
    ADD CONSTRAINT fk_stamp_card FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE;
ALTER TABLE stamps MODIFY COLUMN tenant_id BIGINT NULL;

ALTER TABLE loyalty_cards DROP CHECK ck_cards_tenant_business;
ALTER TABLE loyalty_cards DROP INDEX uk_cards_tenant_user;
ALTER TABLE loyalty_cards ADD UNIQUE KEY user_id (user_id);
ALTER TABLE loyalty_cards MODIFY COLUMN tenant_id BIGINT NULL;

ALTER TABLE users DROP CHECK ck_users_tenant_role;

ALTER TABLE businesses DROP CHECK ck_businesses_slug;
ALTER TABLE businesses DROP INDEX uk_businesses_slug;
ALTER TABLE businesses MODIFY COLUMN slug VARCHAR(80) NULL;
