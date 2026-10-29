-- Rollback manual de V2. Requiere que V3..V5 ya hayan sido revertidas.
ALTER TABLE users DROP FOREIGN KEY fk_users_tenant;
ALTER TABLE users DROP INDEX idx_users_tenant_role;
ALTER TABLE users DROP INDEX uk_users_tenant_phone;
ALTER TABLE users DROP INDEX uk_users_tenant_email;
ALTER TABLE users DROP COLUMN tenant_key;
ALTER TABLE users DROP COLUMN tenant_id;
ALTER TABLE users MODIFY COLUMN role ENUM('CUSTOMER','BUSINESS_OWNER') NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE users ADD UNIQUE KEY email (email);
ALTER TABLE users ADD UNIQUE KEY phone (phone);

ALTER TABLE businesses DROP INDEX idx_businesses_status;
ALTER TABLE businesses DROP FOREIGN KEY fk_business_owner;
ALTER TABLE businesses
    ADD CONSTRAINT fk_business_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE businesses MODIFY COLUMN owner_id BIGINT NOT NULL;
ALTER TABLE businesses DROP COLUMN deleted_at;
ALTER TABLE businesses DROP COLUMN status;
ALTER TABLE businesses DROP COLUMN color_secondary;
ALTER TABLE businesses DROP COLUMN color_primary;
ALTER TABLE businesses DROP COLUMN slug;
