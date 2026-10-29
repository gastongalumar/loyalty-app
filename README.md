# Loyalty Card — SaaS de fidelización multi-tenant

Aplicación web de fidelización con backend REST en Spring Boot y frontend Angular. Cada comercio
(**tenant**) opera su propio programa de sellos y recompensas, con aislamiento de datos entre
negocios.

## Estado

| Componente | Versión |
|---|---|
| Java | **21 (LTS)** |
| Spring Boot | 3.5.16 |
| Maven | 3.9+ |
| Base de datos | MySQL 8 |
| Migraciones | **Flyway** (`db/migration/V1..V5`) |
| Frontend | Angular 17, TypeScript ~5.2 |
| Node.js | 18+ (build Docker usa 20) |

Release 1 implementa multi-tenant funcional: jerarquía de roles, aislamiento por `tenant_id`,
registro público por slug, panel de plataforma y panel de negocio. **Release 1.5** agrega el
canje de recompensas (`POST /api/v1/rewards/{id}/redeem`) con auditoría y control de concurrencia.

## Jerarquía de roles

```
PLATFORM_ADMIN (global, tenant_id = NULL)
  └── crea y gestiona BUSINESSes (tenants)
       ├── BUSINESS_ADMIN (tenant_id = X) → solo gestiona su negocio
       └── CUSTOMER       (tenant_id = X) → solo ve su tarjeta en ese negocio
```

- `PLATFORM_ADMIN` **no** opera dentro de negocios: no agrega sellos ni canjea recompensas.
- Un admin de A nunca ve datos de B; un customer de A tampoco.
- El `tenant_id` de un request autenticado sale **siempre** del JWT. Nunca del body ni de la URL
  (salvo `/api/v1/platform/**`, donde el admin global indica el negocio a gestionar).
- El `tenant_id` de `register`/`login` sale del header `X-Tenant-Slug`, que el frontend resuelve
  del path (`/cafe-a/register`).

## Estructura

```text
.
├── PLAN.md                      # Arquitectura, migraciones y plan de tareas
├── docker-compose.yml           # MySQL + backend + frontend
├── docker-compose.ci.yml        # MySQL efímero para verificar migraciones
├── .env.example                 # todas las variables, sin valores reales
├── scripts/verify-migrations.sh # gate de migraciones (Docker / CI)
├── scripts/verify-migrations.ps1# gate de migraciones con MySQL local (Windows, sin Docker)
├── scripts/run-local.ps1        # arranca backend + frontend leyendo .env
├── backend/
│   ├── Dockerfile               # eclipse-temurin:21
│   └── src/main/
│       ├── java/com/loyalty/
│       │   ├── config/          # Security, errores, bootstrap
│       │   ├── controller/      # /api/auth, /api/public, /api/v1/*
│       │   ├── dto/             # contratos HTTP
│       │   ├── entity/          # Business (tenant), User, LoyaltyCard, Stamp, Reward
│       │   ├── exception/
│       │   ├── mapper/          # MapStruct
│       │   ├── repository/      # TenantAwareRepository base
│       │   ├── security/        # JWT + SecurityUser
│       │   ├── service/
│       │   └── tenant/          # TenantContext, TenantResolver, TenantFilter
│       └── resources/
│           ├── application.yml + application-dev/prod.yml
│           └── db/migration | db/rollback | db/verify
└── frontend/
    ├── Dockerfile               # node 20 → nginx
    └── src/app/
        ├── guards/              # auth, role, slug
        ├── interceptors/        # JWT + X-Tenant-Slug + errores
        ├── pages/               # landing, login, register, customer, business, platform
        └── services/
```

## Configuración local

### 1. Variables de entorno

Copiar `.env.example` a `.env` y completar. El backend no tiene valores por defecto para
`APP_JWT_SECRET` ni para las credenciales de base en el perfil productivo.

| Variable | Uso |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` o `prod` |
| `SPRING_DATASOURCE_URL` | JDBC de MySQL |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | credenciales |
| `APP_JWT_SECRET` | HMAC de 32 bytes UTF-8 mínimo |
| `APP_JWT_EXPIRATION` | milisegundos (24 h por defecto) |
| `APP_CORS_ALLOWED_ORIGINS` | lista separada por comas |
| `APP_BOOTSTRAP_PLATFORM_ADMIN_EMAIL` / `..._PASSWORD` | crea el primer `PLATFORM_ADMIN` (idempotente) |

### 2. Base de datos y migraciones

No hay que ejecutar SQL a mano: Flyway aplica `V1..V5` al arrancar el backend
(`baseline-on-migrate=true`, `baseline-version=0`).

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/loyalty_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME = "loyalty_user"
$env:SPRING_DATASOURCE_PASSWORD = "cambia-esta-clave"
$env:APP_JWT_SECRET = "reemplazar-por-un-secreto-aleatorio-de-32-caracteres-o-mas"
$env:APP_BOOTSTRAP_PLATFORM_ADMIN_EMAIL = "admin@loyalty.local"
$env:APP_BOOTSTRAP_PLATFORM_ADMIN_PASSWORD = "cambia-esta-clave-admin"

Set-Location backend
mvn spring-boot:run
```

#### MySQL local sin Docker (Windows)

Si MySQL 8 ya está instalado como servicio:

```powershell
Start-Service MySQL80   # requiere PowerShell como administrador
```

```sql
CREATE DATABASE IF NOT EXISTS loyalty_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'loyalty_user'@'%' IDENTIFIED BY 'cambia-esta-clave';
GRANT ALL PRIVILEGES ON loyalty_db.* TO 'loyalty_user'@'%';
FLUSH PRIVILEGES;
```

No hace falta ejecutar el esquema a mano: Flyway corre al arrancar el backend. Para verificar
las migraciones contra ese MySQL local (crea una base descartable, aplica V1..V5 y valida
invariantes + constraints):

```powershell
.\scripts\verify-migrations.ps1 -Port 3306 -User root -Password "tu-clave" `
  -Mysql "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
```

Para levantar todo (backend + frontend) leyendo `.env` automáticamente:

```powershell
.\scripts\run-local.ps1            # crea .env desde .env.example si no existe
.\scripts\run-local.ps1 -DryRun    # solo muestra las variables resueltas
```

### 3. Frontend

```powershell
Set-Location frontend
npm ci
npm start
```

Frontend: `http://localhost:4200` · Backend: `http://localhost:8080` · Swagger (solo `dev`):
`http://localhost:8080/swagger-ui.html`

## Rutas del frontend (path-based)

| Ruta | Acceso |
|---|---|
| `/` | elegir negocio por slug |
| `/platform/login` | `PLATFORM_ADMIN` |
| `/platform/businesses` · `/platform/businesses/:id` | `PLATFORM_ADMIN` |
| `/:slug/login` · `/:slug/register` | público |
| `/:slug/customer/card` · `/:slug/customer/qr` | `CUSTOMER` |
| `/:slug/business/dashboard` · `/customers` · `/scanner` · `/rewards` · `/settings` | `BUSINESS_ADMIN` |

Slugs reservados: `platform`, `api`, `assets`, `login`, `register`, `admin`, `customer`.

## API

### Auth (público)

| Método | Ruta | Headers | Notas |
|---|---|---|---|
| `POST` | `/api/auth/register` | `X-Tenant-Slug` **obligatorio** | crea **solo** `CUSTOMER`; `role` distinto de `CUSTOMER` → 400 |
| `POST` | `/api/auth/login` | `X-Tenant-Slug` opcional | con slug: usuario del tenant; sin slug: solo `PLATFORM_ADMIN` |
| `GET` | `/api/public/tenants/{slug}` | — | `{slug,name,status}` |

### Platform (`PLATFORM_ADMIN`)

| Método | Ruta |
|---|---|
| `POST` / `GET` | `/api/v1/platform/businesses` |
| `GET` / `DELETE` | `/api/v1/platform/businesses/{id}` |
| `PATCH` | `/api/v1/platform/businesses/{id}/status` |
| `POST` / `GET` | `/api/v1/platform/businesses/{id}/admins` |

### Business (`BUSINESS_ADMIN`, tenant del JWT)

| Método | Ruta |
|---|---|
| `GET` / `PUT` | `/api/v1/business/me` |
| `GET` | `/api/v1/business/customers?q=&page=&size=` |
| `GET` | `/api/v1/business/customers/{userId}` · `/card` · `/qr` |
| `POST` | `/api/v1/business/stamps` · `/stamps/scan` |

### Customer (`CUSTOMER`)

| Método | Ruta |
|---|---|
| `GET` | `/api/v1/customer/card` |
| `GET` | `/api/v1/customer/qr` |

### Rewards (`BUSINESS_ADMIN`)

| Método | Ruta | Notas |
|---|---|---|
| `GET` | `/api/v1/rewards?status=&cardId=&page=&size=` | solo recompensas del tenant |
| `POST` | `/api/v1/rewards/{id}/redeem` | `AVAILABLE → REDEEMED`; 409 si ya fue canjeada, 404 si es de otro tenant |

### Eliminados

`/api/admin/business`, `/api/admin/customers*`, `/api/admin/stamps*` y `/api/customer/*` ya no
existen (responden 404). Fueron reemplazados por `/api/v1/*`. El campo `role` de
`POST /api/auth/register` quedó anulado por diseño.

### Errores

Formato uniforme `{code, message, timestamp, path}`. `403 tenant_mismatch` cuando
`X-Tenant-Slug` no coincide con el JWT; `404` tanto para recurso inexistente como para recurso
de otro tenant (no se filtra existencia).

## Migraciones y rollback

| Versión | Contenido |
|---|---|
| `V1__baseline.sql` | esquema heredado congelado (idempotente) |
| `V2__tenant_businesses_users.sql` | `businesses.slug/status/colores/deleted_at`; `users.tenant_id` + `tenant_key` + uniques compuestos; rol a `VARCHAR` |
| `V3__tenant_child_tables.sql` | `tenant_id` en cards/stamps/rewards + `redeemed_by_id` |
| `V4__backfill_tenants.sql` | `BUSINESS_OWNER → BUSINESS_ADMIN`, slugs y `tenant_id` |
| `V5__tenant_constraints.sql` | `NOT NULL`, `CHECK`, FKs compuestas, ENUM→VARCHAR |

Rollbacks manuales en `backend/src/main/resources/db/rollback/*.down.sql` (Flyway Community no
tiene `undo`). Antes de migrar una base con datos: `mysqldump`.

Verificación automatizada (MySQL 8 limpio en Docker):

```bash
bash scripts/verify-migrations.sh
```

En Windows con MySQL local (sin Docker):

```powershell
.\scripts\verify-migrations.ps1 -Password "tu-clave"
```

Ambos corren `flyway:migrate`, las queries de `db/verify/V4_verification.sql`, la prueba
negativa de constraints y exigen `flyway_schema_history` con las 5 migraciones en verde.
Verificado sobre MySQL 8.0.43: V1..V5 aplican limpias y los cuatro rollbacks (`V5..V2`)
devuelven el esquema a la forma de V1.

> **TODO-01** — La versión actual de `V4` asume una base **sin datos a preservar** (portfolio).
> Si se migra una base con datos reales, reemplazar por la versión completa del `PLAN.md` §4
> (tenant `legacy` para huérfanos y normalización de `redeemed_at`) antes de ejecutar.

## Tests y build

```powershell
mvn -pl backend verify                 # 48 tests (unit + aislamiento multi-tenant + canje)
cd frontend; npm run build
```

Los tests usan H2 con `ddl-auto=create-drop` y Flyway deshabilitado (las migraciones son
MySQL-específicas). La cobertura real de las migraciones la da `scripts/verify-migrations.sh` +
CI (`.github/workflows/backend-ci.yml`).

## Docker

```bash
cp .env.example .env    # completar secretos
docker compose up --build
```

Servicios: `db` (MySQL 8), `backend` (temurin 21, health `/actuator/health`), `frontend`
(nginx, proxy `/api/` al backend). El frontend de producción usa `apiUrl: '/api'` (relativo).

## Seguridad

- El JWT incluye `uid`, `role`, `tid` y `slug`; el filtro revalida el tenant contra la base.
- `TenantAwareRepository` obliga a pasar `tenant_id` en cada finder tenant-scoped.
- `TenantFilter` corta requests con `businesses.status != ACTIVE` y valida `X-Tenant-Slug`.
- Swagger deshabilitado en `prod`; secretos solo por variables de entorno.
- `localStorage` se usa para el JWT (decisión de MVP; sin refresh tokens ni 2FA).

## Limitaciones conocidas

1. Branding por tenant (colores/logo dinámicos): R2 (las columnas ya existen).
2. PWA por tenant: R3.
3. Sin paginación infinita ni búsqueda full-text; listas paginadas simples.
4. `X-Tenant-Slug` puede convivir con subdominios en el futuro: solo hay que agregar otra
   implementación de `TenantResolver`.
