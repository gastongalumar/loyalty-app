-- Prueba negativa de V5: la FK compuesta debe rechazar un sello cruzado.
-- Ejecutar a mano sobre una copia. El INSERT DEBE fallar con errno 1452.
--
-- Reemplazar <CARD_ID> y <ADMIN_ID> por filas reales del tenant A.
--
-- INSERT INTO stamps (tenant_id, loyalty_card_id, added_by_id)
-- VALUES (999999, <CARD_ID>, <ADMIN_ID>);

SELECT 'constraints esperados' AS check_name, COUNT(*) AS failures
FROM information_schema.table_constraints
WHERE table_schema = DATABASE()
  AND constraint_name IN (
      'ck_users_tenant_role',
      'ck_cards_tenant_business',
      'ck_businesses_slug',
      'fk_stamp_card_tenant',
      'fk_reward_card_tenant',
      'uk_businesses_slug',
      'uk_users_tenant_email'
  )
HAVING COUNT(*) < 7;
