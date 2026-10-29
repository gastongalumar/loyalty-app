-- Verificación post-migración (V4). Todas las consultas deben devolver 0 filas.
SELECT 'roles heredados' AS check_name, COUNT(*) AS failures FROM users WHERE role = 'BUSINESS_OWNER';
SELECT 'usuarios sin tenant' AS check_name, COUNT(*) AS failures
FROM users WHERE role <> 'PLATFORM_ADMIN' AND tenant_id IS NULL;
SELECT 'platform admin con tenant' AS check_name, COUNT(*) AS failures
FROM users WHERE role = 'PLATFORM_ADMIN' AND tenant_id IS NOT NULL;
SELECT 'businesses sin slug' AS check_name, COUNT(*) AS failures
FROM businesses WHERE slug IS NULL OR slug = '';
SELECT 'slugs duplicados' AS check_name, COUNT(*) AS failures
FROM (SELECT slug FROM businesses GROUP BY slug HAVING COUNT(*) > 1) d;
SELECT 'cards con tenant inconsistente' AS check_name, COUNT(*) AS failures
FROM loyalty_cards WHERE tenant_id <> business_id;
SELECT 'stamps de otro tenant' AS check_name, COUNT(*) AS failures
FROM stamps s JOIN loyalty_cards c ON c.id = s.loyalty_card_id WHERE s.tenant_id <> c.tenant_id;
SELECT 'rewards de otro tenant' AS check_name, COUNT(*) AS failures
FROM rewards r JOIN loyalty_cards c ON c.id = r.loyalty_card_id WHERE r.tenant_id <> c.tenant_id;
SELECT 'emails duplicados por tenant' AS check_name, COUNT(*) AS failures
FROM (SELECT tenant_key, email FROM users GROUP BY tenant_key, email HAVING COUNT(*) > 1) d;
SELECT 'admin de tenant ajeno a su negocio' AS check_name, COUNT(*) AS failures
FROM users u JOIN businesses b ON b.owner_id = u.id
WHERE u.role IN ('BUSINESS_ADMIN','CUSTOMER') AND u.tenant_id <> b.id;
