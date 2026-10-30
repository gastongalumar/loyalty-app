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
**Release 2** agrega branding por tenant: colores y logo dinámicos expuestos por
`GET /api/public/tenants/{slug}` y aplicados como CSS custom properties.
**Release 3** agrega PWA por tenant: manifest dinámico, service worker con caches
particionadas por slug y prompt de instalación.

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
├── docker-compose.yml           # MySQL + backend + frontend (prod, solo publica 8090)
├── docker-compose.dev.yml       # solo MySQL para desarrollo local (3307)
├── docker-compose.ci.yml        # MySQL efímero para verificar migraciones
├── .env.example                 # variables de desarrollo local
├── .env.prod.example            # variables de producción (VM)
├── scripts/verify-migrations.sh # gate de migraciones (Docker / CI)
├── scripts/verify-migrations.ps1# gate de migraciones con MySQL local (Windows, sin Docker)
├── scripts/run-local.ps1        # arranca backend + frontend leyendo .env
├── scripts/update.sh            # deploy: pull + build + up en la VM
├── scripts/backup.sh            # mysqldump comprimido a backups/
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

## Sistema de diseño

- Tokens en `frontend/src/styles/tokens.css`; **ningún otro archivo tiene hex/rgba**.
- Dos temas: `light-neumorphic` (Bone) y `dark-purple` (Noche), persistidos en
  `localStorage['loyalty.theme']` con anti-FOUC en `index.html`.
- El branding del tenant ajusta el acento y la tarjeta manteniendo AA.
- Guía: [`docs/DESIGN_DIRECTION.md`](docs/DESIGN_DIRECTION.md) · reglas para agentes:
  [`frontend/AGENTS.md`](frontend/AGENTS.md).
- Verificación de contraste: `node scripts/check-contrast.mjs`.

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
| `GET` | `/api/public/tenants/{slug}` | — | `{slug,name,status,colorPrimary,colorSecondary,logoUrl}` |
| `GET` | `/api/public/tenants/{slug}/manifest.webmanifest` | — | manifest PWA del tenant (`start_url` y `scope` con el slug) |

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
mvn -pl backend verify                 # 52 tests (unit + aislamiento + canje + branding + PWA)
cd frontend; npm run build
cd frontend; npm run test:ci           # 19 specs (guards, interceptor, theme, auth)
node scripts/check-contrast.mjs        # AA en ambos temas
```

Los tests usan H2 con `ddl-auto=create-drop` y Flyway deshabilitado (las migraciones son
MySQL-específicas). La cobertura real de las migraciones la da `scripts/verify-migrations.sh` +
CI (`.github/workflows/backend-ci.yml`).

Verificado con **Temurin 21.0.13 LTS** (52 tests verdes sobre JVM 21) y **MySQL 8.0.43**
(migraciones V1..V5 + rollbacks).

## Branding por tenant (R2)

- `GET /api/public/tenants/{slug}` devuelve `colorPrimary`, `colorSecondary` y `logoUrl`.
- El frontend los aplica como variables CSS (`--primary`, `--secondary`, `--primary-light`,
  `--primary-dark`) al entrar a `/:slug/**`; si el tenant no definió colores, quedan los del tema.
- El `BUSINESS_ADMIN` los edita en **Configuración → Apariencia** (`PUT /api/v1/business/me`),
  con validación `^#[0-9A-Fa-f]{6}$`.
- El logo es una **URL remota** (sin MinIO ni BLOB en MySQL); la vista previa usa cache busting
  con `?v=<timestamp>`.
- Un admin de A no puede cambiar el branding de B: el `tenant_id` sale del JWT.

## PWA por tenant (R3)

- `GET /api/public/tenants/{slug}/manifest.webmanifest` arma el manifest en runtime con
  `name`, `theme_color`, `background_color`, `start_url: /{slug}/login` y `scope: /{slug}/`,
  más iconos PNG 192/512 y 512 maskable.
- `frontend/src/manifest.webmanifest` es el fallback estático (landing, scope `/`); al resolver
  un tenant, `PwaService` cambia el `href` al manifest dinámico y actualiza `theme-color` y
  `apple-mobile-web-app-title`.
- Un **único service worker** (`/sw.js`, scope `/`) cachea:
  - assets de la app → `loyalty-shell-v1` (compartido, sin datos de negocio);
  - navegación de cada tenant → `loyalty-tenant-<slug>-v1`.
- No hay fallback cruzado: la caché se elige por el primer segmento de la URL y `/api/**`,
  `/actuator/**` y `/platform/**` no se cachean nunca. Un tenant no puede servir HTML de otro.
- Al cambiar de tenant o cerrar sesión, `PwaService` envía `CLEAR_TENANT` y el SW borra
  `loyalty-tenant-<slug>-*`.
- El manifest y el `theme-color` se inyectan en runtime solo cuando hay slug, y se limpian al
  entrar a `/platform`.
- El botón **Instalar app** aparece cuando el navegador dispara `beforeinstallprompt`.
- El SW se registra **solo en producción** (`environment.production`), para no interferir con
  `ng serve`. Para probar la PWA: `npm run build` y servir `dist/loyalty-frontend/browser`
  (por ejemplo con el nginx del Compose o cualquier servidor estático en `localhost`).

## Docker y despliegue en la VM

### Servicios

| Servicio | Imagen | Puertos | Notas |
|---|---|---|---|
| `db` | `mysql:8.0` | solo red interna `3306` | volumen `mysql_data`; **sin puerto publicado** |
| `backend` | build `./backend` (temurin 21) | solo red interna `8080` | health `/actuator/health` |
| `frontend` | build `./frontend` (nginx) | host **`${HTTP_PORT:-8090}`** → `80` | proxy `/api/`, health `/healthz` |

Solo se publica el frontend. MySQL y el backend quedan en la red `loyalty_net` y no son
accesibles desde Internet.

### Producción en la VM (OVH)

| Dato | Valor |
|---|---|
| Host | `40.160.241.75` |
| DNS | `loyalty.programandos.site` → `40.160.241.75` |
| Puerto local del stack | **`8090`** |
| Reverse proxy | Caddy/Nginx del host → `127.0.0.1:8090` |

```bash
# en la VM
git clone https://github.com/gastongalumar/loyalty-app.git
cd loyalty-app
cp .env.prod.example .env
nano .env                        # completar MYSQL_*, APP_JWT_SECRET y bootstrap
docker compose up -d --build
docker compose ps
```

Verificación desde la VM:

```bash
curl -fsS http://127.0.0.1:8090/healthz
curl -fsS http://127.0.0.1:8090/api/public/tenants/<slug>
docker compose exec -T backend wget -qO- http://127.0.0.1:8080/actuator/health
docker compose logs -f backend
```

> `docker compose` falla a propósito si faltan `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` o
> `APP_JWT_SECRET` (validación `${VAR:?}`). No hay valores por defecto en producción.

### Reverse proxy + HTTPS

Caddy en el host (recomendado, TLS automático):

```caddyfile
loyalty.programandos.site {
    reverse_proxy 127.0.0.1:8090
}
```

Nginx del host:

```nginx
server {
    listen 80;
    server_name loyalty.programandos.site;
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Firewall (no abrir 8080, 8090 ni 3306 a Internet):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Actualizar y respaldar

```bash
./scripts/update.sh     # git pull + build + up -d + prune
./scripts/backup.sh     # mysqldump comprimido en backups/
```

El backup se guarda en `backups/` (ignorado por git). Para restaurar:

```bash
gunzip -c backups/loyalty_YYYYmmdd_HHMMSS.sql.gz | \
  docker compose exec -T db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

### Desarrollo local

```bash
# opción A: MySQL en Docker + procesos locales
docker compose -f docker-compose.dev.yml up -d   # MySQL en localhost:3307
./scripts/run-local.ps1                          # backend + frontend con .env de dev

# opción B: stack completo en Docker
cp .env.example .env
docker compose up --build                        # http://localhost:8090
```

El frontend de producción usa `apiUrl: '/api'` (relativo) y nginx proxya al backend. El
service worker se registra solo en builds de producción: para probar la PWA serví
`dist/loyalty-frontend/browser` por HTTP en `localhost` o usá el stack de Docker.

## Seguridad

- El JWT incluye `uid`, `role`, `tid` y `slug`; el filtro revalida el tenant contra la base.
- `TenantAwareRepository` obliga a pasar `tenant_id` en cada finder tenant-scoped.
- `TenantFilter` corta requests con `businesses.status != ACTIVE` y valida `X-Tenant-Slug`.
- Swagger deshabilitado en `prod`; secretos solo por variables de entorno.
- `localStorage` se usa para el JWT (decisión de MVP; sin refresh tokens ni 2FA).

## Limitaciones conocidas

1. Sin paginación infinita ni búsqueda full-text; listas paginadas simples.
2. `X-Tenant-Slug` puede convivir con subdominios en el futuro: solo hay que agregar otra
   implementación de `TenantResolver`.
3. El logo se referencia por URL; no hay upload ni almacenamiento de archivos.
4. La PWA se registra solo en builds de producción (decisión para no cachear en `ng serve`).
