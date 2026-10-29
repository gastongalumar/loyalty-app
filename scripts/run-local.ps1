# Arranca backend + frontend para prueba local en Windows, cargando .env.
#
# Uso:
#   .\scripts\run-local.ps1                 # backend y frontend en ventanas nuevas
#   .\scripts\run-local.ps1 -Target backend
#   .\scripts\run-local.ps1 -DryRun         # solo muestra las variables resueltas
#
# Requisitos: MySQL 8 corriendo y la base creada (ver README).

param(
    [ValidateSet("both", "backend", "frontend")]
    [string]$Target = "both",
    [string]$EnvFile = ".env",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path $EnvFile)) {
    Copy-Item ".env.example" $EnvFile
    Write-Host "No existia ${EnvFile}: se creo desde .env.example." -ForegroundColor Yellow
    Write-Host "Editalo con tus credenciales reales antes de seguir." -ForegroundColor Yellow
}

$loaded = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    $loaded[$key] = $value
    Set-Item -Path "Env:$key" -Value $value
}

if (-not $loaded.ContainsKey("SPRING_PROFILES_ACTIVE") -or $loaded["SPRING_PROFILES_ACTIVE"] -eq "") {
    $env:SPRING_PROFILES_ACTIVE = "dev"
}

if ($env:APP_JWT_SECRET -match "reemplazar|change-me|cambia") {
    Write-Host "ADVERTENCIA: APP_JWT_SECRET sigue con el valor de ejemplo." -ForegroundColor Yellow
}
if ($env:SPRING_DATASOURCE_PASSWORD -match "cambia-esta-clave") {
    Write-Host "ADVERTENCIA: SPRING_DATASOURCE_PASSWORD sigue con el valor de ejemplo." -ForegroundColor Yellow
}

Write-Host "Variables cargadas desde $EnvFile (perfil $env:SPRING_PROFILES_ACTIVE):" -ForegroundColor Cyan
$loaded.Keys | Sort-Object | ForEach-Object {
    $shown = $loaded[$_]
    if ($_ -match "PASSWORD|SECRET") {
        $shown = if ($shown.Length -gt 4) { $shown.Substring(0, 2) + "***" } else { "***" }
    }
    Write-Host ("  {0}={1}" -f $_, $shown)
}

if ($DryRun) {
    Write-Host "DryRun: no se inicia ningun proceso." -ForegroundColor Yellow
    exit 0
}

function Start-Backend {
    Write-Host "==> Backend en http://localhost:8080 (Swagger: /swagger-ui.html)" -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command", "Set-Location '$repoRoot\backend'; mvn spring-boot:run"
    ) | Out-Null
}

function Start-Frontend {
    Write-Host "==> Frontend en http://localhost:4200" -ForegroundColor Green
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command", "Set-Location '$repoRoot\frontend'; npm start"
    ) | Out-Null
}

switch ($Target) {
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    default {
        Start-Backend
        Start-Sleep -Seconds 2
        Start-Frontend
    }
}

Write-Host ""
Write-Host "Esperando el arranque (Flyway aplica V1..V5 solo la primera vez)." -ForegroundColor Cyan
Write-Host "Platform admin: http://localhost:4200/platform/login" -ForegroundColor Cyan
Write-Host "Tenant:         http://localhost:4200/<slug>/login" -ForegroundColor Cyan
