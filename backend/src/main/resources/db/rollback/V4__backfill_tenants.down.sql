-- Rollback manual de V4 (solo válido si no se crearon datos nuevos).
UPDATE rewards SET tenant_id = NULL;
UPDATE stamps SET tenant_id = NULL;
UPDATE loyalty_cards SET tenant_id = NULL;
UPDATE users SET tenant_id = NULL;
UPDATE users SET role = 'BUSINESS_OWNER' WHERE role = 'BUSINESS_ADMIN';
UPDATE businesses SET slug = NULL;
