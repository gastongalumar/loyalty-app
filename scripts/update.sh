#!/usr/bin/env bash
# Actualiza el despliegue en la VM: trae cambios, reconstruye y reinicia.
# Uso: ./scripts/update.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: falta .env. Copiá .env.example a .env y configuralo." >&2
  exit 1
fi

echo "→ Descargando cambios..."
git pull --ff-only

echo "→ Reconstruyendo imágenes..."
docker compose build

echo "→ Levantando servicios..."
docker compose up -d --remove-orphans

echo "→ Limpiando imágenes viejas..."
docker image prune -f

echo
echo "Estado actual:"
docker compose ps
