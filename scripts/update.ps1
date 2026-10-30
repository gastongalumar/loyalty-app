# Actualiza el despliegue en un host Windows: pull, build y restart.
# Uso (PowerShell en la raíz del repo): .\scripts\update.ps1
$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path ".env")) {
    Write-Host "ERROR: falta .env. Copiá .env.prod.example a .env y configuralo." -ForegroundColor Red
    exit 1
}

Write-Host "-> Descargando cambios..."
git pull --ff-only
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "-> Reconstruyendo imagenes..."
docker compose build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "-> Levantando servicios..."
docker compose up -d --remove-orphans
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "-> Limpiando imagenes viejas..."
docker image prune -f | Out-Null

Write-Host ""
Write-Host "Estado actual:"
docker compose ps
