-- Rollback manual de V1__baseline.sql
-- ADVERTENCIA: borra todas las tablas. Solo para entornos descartables.
-- Ejecutar con: mysql -u <user> -p <db> < V1__baseline.down.sql

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS stamps;
DROP TABLE IF EXISTS loyalty_cards;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS flyway_schema_history;
SET FOREIGN_KEY_CHECKS = 1;
