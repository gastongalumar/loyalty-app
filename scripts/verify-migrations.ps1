# Verifica las migraciones Flyway contra un MySQL 8 local (sin Docker).
#
# Uso:
#   .\scripts\verify-migrations.ps1
#   .\scripts\verify-migrations.ps1 -Port 3306 -User root -Password "mi-clave"
#   .\scripts\verify-migrations.ps1 -Mysql "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
#
# Crea una base descartable (por defecto loyalty_local_verify), aplica V1..V8,
# corre las queries de verificación y falla si algo no cierra.

param(
    [string]$DbHost = "127.0.0.1",
    [int]$Port = 3306,
    [string]$Database = "loyalty_local_verify",
    [string]$User = "root",
    [string]$Password = "",
    [string]$Mysql = "mysql"
)

# stderr de mysql.exe no debe abortar el script en PowerShell 5.1
$ErrorActionPreference = "Continue"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Evita el warning "password on the command line"
$env:MYSQL_PWD = $Password

function Invoke-MysqlRaw {
    param([string[]]$Arguments)
    $output = & $Mysql @Arguments 2>$null
    return @{ ExitCode = $LASTEXITCODE; Output = $output }
}

function Invoke-Sql {
    param([string]$Sql, [switch]$NoDatabase)
    $mysqlArgs = @("--protocol=TCP", "-h", $DbHost, "-P", "$Port", "-u", $User)
    if (-not $NoDatabase) {
        $mysqlArgs += @("-D", $Database)
    }
    $mysqlArgs += @("-N", "-B", "-e", $Sql)

    $result = Invoke-MysqlRaw $mysqlArgs
    if ($result.ExitCode -ne 0) {
        throw "mysql fallo al ejecutar: $Sql"
    }
    return $result.Output
}

function Assert-Zero {
    param([string]$Description, [string]$Sql)
    $value = ((Invoke-Sql $Sql) -join "").Trim()
    if ($value -ne "0" -and $value -ne "") {
        Write-Host "FAIL: $Description (resultado: $value)" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: $Description" -ForegroundColor Green
}

Write-Host "==> Creando base descartable $Database"
Invoke-Sql -NoDatabase -Sql "DROP DATABASE IF EXISTS $Database; CREATE DATABASE $Database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | Out-Null

$env:SPRING_DATASOURCE_URL = "jdbc:mysql://${DbHost}:${Port}/${Database}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME = $User
$env:SPRING_DATASOURCE_PASSWORD = $Password

Write-Host "==> Aplicando migraciones"
mvn -q -pl backend flyway:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: flyway:migrate" -ForegroundColor Red
    exit 1
}

$applied = ((Invoke-Sql "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1;") -join "").Trim()
if ([int]$applied -lt 8) {
    Write-Host "FAIL: se esperaban >= 8 migraciones aplicadas, hay $applied" -ForegroundColor Red
    exit 1
}
Write-Host "OK: $applied migraciones aplicadas" -ForegroundColor Green

Write-Host "==> Invariantes multi-tenant"
Assert-Zero "sin roles BUSINESS_OWNER" "SELECT COUNT(*) FROM users WHERE role='BUSINESS_OWNER';"
Assert-Zero "todo usuario no-platform tiene tenant" "SELECT COUNT(*) FROM users WHERE role<>'PLATFORM_ADMIN' AND tenant_id IS NULL;"
Assert-Zero "todo business tiene slug" "SELECT COUNT(*) FROM businesses WHERE slug IS NULL OR slug='';"
Assert-Zero "slugs unicos" "SELECT COUNT(*) FROM (SELECT slug FROM businesses GROUP BY slug HAVING COUNT(*)>1) d;"
Assert-Zero "cards.tenant_id = business_id" "SELECT COUNT(*) FROM loyalty_cards WHERE tenant_id <> business_id;"
Assert-Zero "stamps coherentes con su card" "SELECT COUNT(*) FROM stamps s JOIN loyalty_cards c ON c.id=s.loyalty_card_id WHERE s.tenant_id<>c.tenant_id;"
Assert-Zero "rewards coherentes con su card" "SELECT COUNT(*) FROM rewards r JOIN loyalty_cards c ON c.id=r.loyalty_card_id WHERE r.tenant_id<>c.tenant_id;"
Assert-Zero "emails unicos por tenant" "SELECT COUNT(*) FROM (SELECT tenant_key,email FROM users GROUP BY tenant_key,email HAVING COUNT(*)>1) d;"

Write-Host "==> Constraints esperados"
$constraints = ((Invoke-Sql "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema='$Database' AND constraint_name IN ('ck_users_tenant_role','ck_cards_tenant_business','ck_businesses_slug','fk_stamp_card_tenant','fk_reward_card_tenant','uk_businesses_slug','uk_users_tenant_email');") -join "").Trim()
if ([int]$constraints -lt 7) {
    Write-Host "FAIL: faltan constraints ($constraints/7)" -ForegroundColor Red
    exit 1
}
Write-Host "OK: 7 constraints presentes" -ForegroundColor Green

Write-Host "==> Prueba negativa (FK compuesta)"
$cardId = ((Invoke-Sql "SELECT id FROM loyalty_cards ORDER BY id LIMIT 1;") -join "").Trim()
$adminId = ((Invoke-Sql "SELECT id FROM users WHERE role='BUSINESS_ADMIN' ORDER BY id LIMIT 1;") -join "").Trim()

if ($cardId -ne "" -and $adminId -ne "") {
    $negArgs = @("--protocol=TCP", "-h", $DbHost, "-P", "$Port", "-u", $User, "-D", $Database, "-e",
        "INSERT INTO stamps (tenant_id, loyalty_card_id, added_by_id) VALUES (999999, $cardId, $adminId);")
    $result = Invoke-MysqlRaw $negArgs
    if ($result.ExitCode -eq 0) {
        Write-Host "FAIL: se acepto un sello con tenant cruzado" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: la FK compuesta rechaza sellos cruzados" -ForegroundColor Green
} else {
    Write-Host "SKIP: base sin datos semilla para la prueba negativa" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Migraciones verificadas en $Database" -ForegroundColor Cyan
