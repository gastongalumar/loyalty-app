#!/usr/bin/env bash
# Backup de la base de datos a ./backups (gzip).
# Uso: ./scripts/backup.sh
# Restaurar:
#   gunzip -c backups/loyalty_YYYYmmdd_HHMMSS.sql.gz | \
#     docker compose exec -T db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: falta .env." >&2
  exit 1
fi

mkdir -p backups

# Las variables MYSQL_* las inyecta Compose en el contenedor; no hacen falta en el host.
STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="backups/loyalty_${STAMP}.sql"

echo "→ Generando $FILE ..."
docker compose exec -T db sh -c \
  'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --routines --no-tablespaces "$MYSQL_DATABASE"' \
  > "$FILE"

gzip "$FILE"
echo "Backup listo: ${FILE}.gz"
