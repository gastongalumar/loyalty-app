# AGENTS.md — Loyalty frontend (Angular)

## Stack

Angular 17 standalone + TypeScript ~5.2 + CSS plano + `ngx-translate`.
Prohibido: frameworks CSS (Tailwind/Bootstrap), CSS-in-JS, JavaScript sin tipos,
`any` innecesario y estilos inline con colores.

## Antes de tocar UI

1. Leer `../docs/DESIGN_DIRECTION.md`.
2. Usar solo tokens de `src/styles/tokens.css`.
3. Si falta un token, proponerlo y documentarlo primero.
4. Revisar si el patrón ya existe en `src/styles.css` antes de duplicarlo.

## Estructura y capas

- `pages/` orquesta la vista y navega; no llama `HttpClient` directo.
- `services/` encapsula HTTP y estado (`AuthService`, `LoyaltyService`, `PlatformService`, `RewardService`).
- `guards/` protege por sesión, rol (`PLATFORM_ADMIN`, `BUSINESS_ADMIN`, `CUSTOMER`) y slug.
- `interceptors/` agrega JWT, `X-Tenant-Slug` (solo auth público) y manejo de errores.
- `models/` define los contratos; no duplicar interfaces en servicios.
- Componentes standalone; sin `NgModule`.

## Multi-tenant

- El `tenant_id` de un request autenticado sale **del JWT**, nunca del body ni de la URL.
- `X-Tenant-Slug` se envía **solo** a `/api/auth/*`; las rutas autenticadas no lo necesitan.
- Rutas del frontend: `/:slug/...`; `/platform/*` no lleva slug.
- Un endpoint de negocio jamás debe recibir `businessId` por query/body.
- Al agregar una pantalla con datos, verificar el caso “token de A contra recurso de B” → 404.

## Auth

- JWT en `localStorage` (decisión de MVP); `logout` limpia token, usuario y slug.
- El rol y el tenant del cliente son solo para navegación: el backend siempre revalida.
- No inventar refresh tokens, 2FA ni rate limiting.

## Diseño

- Dos temas: `light-neumorphic` (Bone) y `dark-purple` (Noche). Persistencia en
  `localStorage['loyalty.theme']` (`light` | `dark` | `system`).
- **Cero hex/rgba fuera de `tokens.css`.** El gate es:
  `grep -RInE "#[0-9a-fA-F]{3,8}|rgba?\(" frontend/src --exclude=tokens.css` → 0.
- Colores por tenant: `ThemeService` ajusta el acento para AA; no pisar tokens a mano.
- AA mínimo; `:focus-visible`; `prefers-reduced-motion`; sin `!important`.
- Iconos con `aria-hidden`, botones con `aria-label` cuando son solo icono.

## Testing y gates

- `npm run build` debe quedar limpio.
- `node scripts/check-contrast.mjs` valida AA en ambos temas.
- `mvn -pl backend verify` valida aislamiento multi-tenant y contratos.
- No commitear `.env`, secretos ni `dist/`.

## Prohibido

- `innerHTML` con datos del usuario.
- Lógica de negocio en templates.
- Duplicar llamadas HTTP en componentes.
- Agregar dependencias de UI sin justificarlo en el PR.
