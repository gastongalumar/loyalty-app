#!/usr/bin/env bash
# Verifica que las migraciones Flyway aplican sobre MySQL 8 limpio y que
# el esquema resultante cumple los invariantes multi-tenant.
#
# Uso local:  bash scripts/verify-migrations.sh
# CI:         mismo comando (ubuntu-latest con Docker disponible)
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.ci.yml}"
DB_PORT="${DB_PORT:-3307}"
DB_NAME="${MYSQL_DATABASE:-loyalty_ci}"
DB_USER="${MYSQL_USER:-loyalty_ci}"
DB_PASS="${MYSQL_PASSWORD:-ci-pass}"
ROOT_PASS="${MYSQL_ROOT_PASSWORD:-ci-root-pass}"

export MYSQL_ROOT_PASSWORD="$ROOT_PASS"
export MYSQL_DATABASE="$DB_NAME"
export MYSQL_USER="$DB_USER"
export MYSQL_PASSWORD="$DB_PASS"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Levantando MySQL 8 efímero"
docker compose -f "$COMPOSE_FILE" up -d --wait db

echo "==> Aplicando migraciones con Flyway"
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:${DB_PORT}/${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="$DB_USER"
export SPRING_DATASOURCE_PASSWORD="$DB_PASS"

mvn -q -pl backend flyway:migrate

mysql_query() {
  docker compose -f "$COMPOSE_FILE" exec -T db \
    mysql --protocol=TCP -h 127.0.0.1 -u root -p"$ROOT_PASS" -N -B "$DB_NAME" -e "$1"
}

expect_zero() {
  local description="$1"
  local sql="$2"
  local value
  value="$(mysql_query "$sql" | tr -d '[:space:]')"
  if [[ "$value" != "0" && -n "$value" ]]; then
    echo "FAIL: $description (resultado: $value)"
    exit 1
  fi
  echo "OK: $description"
}

echo "==> Verificando historial Flyway"
APPLIED="$(mysql_query "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1;" | tr -d '[:space:]')"
if [[ "$APPLIED" -lt 6 ]]; then
  echo "FAIL: se esperaban >= 6 migraciones aplicadas, hay $APPLIED"
  exit 1
fi
echo "OK: $APPLIED migraciones aplicadas"

echo "==> Verificando invariantes multi-tenant"
expect_zero "sin roles BUSINESS_OWNER" \
  "SELECT COUNT(*) FROM users WHERE role='BUSINESS_OWNER';"
expect_zero "todo usuario no-platform tiene tenant" \
  "SELECT COUNT(*) FROM users WHERE role<>'PLATFORM_ADMIN' AND tenant_id IS NULL;"
expect_zero "todo business tiene slug" \
  "SELECT COUNT(*) FROM businesses WHERE slug IS NULL OR slug='';"
expect_zero "slugs únicos" \
  "SELECT COUNT(*) FROM (SELECT slug FROM businesses GROUP BY slug HAVING COUNT(*) > 1) d;"
expect_zero "cards.tenant_id = business_id" \
  "SELECT COUNT(*) FROM loyalty_cards WHERE tenant_id <> business_id;"
expect_zero "stamps coherentes con su card" \
  "SELECT COUNT(*) FROM stamps s JOIN loyalty_cards c ON c.id=s.loyalty_card_id WHERE s.tenant_id<>c.tenant_id;"
expect_zero "rewards coherentes con su card" \
  "SELECT COUNT(*) FROM rewards r JOIN loyalty_cards c ON c.id=r.loyalty_card_id WHERE r.tenant_id<>c.tenant_id;"
expect_zero "emails únicos por tenant" \
  "SELECT COUNT(*) FROM (SELECT tenant_key, email FROM users GROUP BY tenant_key, email HAVING COUNT(*) > 1) d;"

echo "==> Verificando constraints (prueba negativa)"
TENANT_A="$(mysql_query "SELECT id FROM businesses ORDER BY id LIMIT 1;" | tr -d '[:space:]')"
CARD_A="$(mysql_query "SELECT id FROM loyalty_cards WHERE tenant_id=${TENANT_A:-0} LIMIT 1;" | tr -d '[:space:]')"

if [[ -n "${CARD_A:-}" && -n "${TENANT_A:-}" ]]; then
  set +e
  mysql_query "INSERT INTO stamps (tenant_id, loyalty_card_id, added_by_id) VALUES (999999, ${CARD_A}, 1);" >/dev/null 2>&1
  NEGATIVE_RC=$?
  set -e
  if [[ "$NEGATIVE_RC" -eq 0 ]]; then
    echo "FAIL: se insertó un sello con tenant cruzado (FK compuesta inactiva)"
    exit 1
  fi
  echo "OK: la FK compuesta rechaza sellos con tenant cruzado"
else
  echo "SKIP: no hay filas para la prueba negativa (DB sin datos semilla)"
fi

echo "==> Migraciones OK"
