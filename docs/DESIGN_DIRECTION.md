# Dirección de diseño — Loyalty Card

## Tesis

Loyalty es una herramienta de mostrador, no una landing. La interfaz debe sentirse como una
**tarjeta de cartón sobre un mostrador de madera**: papel cálido, tinta oscura y un acento
ember usado solo como señal (acción primaria, foco, recompensa). El neumorfismo queda limitado
a controles y superficies táctiles; la jerarquía se resuelve con composición, espacio y hairlines.

La app tiene que transmitir **pertenencia y confianza**: el cliente ve *su* negocio, no una
plantilla genérica. Por eso el acento y la tarjeta pueden personalizarse por tenant sin romper
el sistema ni el contraste.

## Principios

1. **La tarjeta es el objeto central.** Sellos, progreso y recompensa primero; el chrome desaparece.
2. **Superficies con propósito.** Elevación solo para lo interactivo o lo que se superpone.
3. **Un solo acento.** El color del tenant señala acción y foco; no se usa como decoración.
4. **Densidad legible.** Listas compactas en desktop, tarjetas apiladas en mobile.
5. **Movimiento sobrio.** Transiciones cortas, sin autoplay, respetando `prefers-reduced-motion`.
6. **Cinco temas, un sistema.** Claro, oscuro y tres paletas con carácter; los componentes no saben qué tema está activo.

## Paletas

### `light-neumorphic` (Bone)

- Fondo: papel cálido `--color-bg`.
- Superficies: papel elevado `--color-surface`, `--color-surface-raised`.
- Texto: tinta `--color-text`; secundarios `--color-text-muted` / `--color-text-subtle`.
- Acento: ember `--color-accent`.
- Bordes: hairlines cálidos; sombras dobles claras/oscuras de bajo contraste.

### `dark-purple` (Noche)

- Fondo: casi negro con matiz violeta.
- Superficies: violeta profundo.
- Texto: marfil.
- Acento: coral.
- Sombras profundas, sin invertir los colores del tema claro.

### `sage-mist` (Salvia)

- Fondo: verde papel, luminoso y sereno.
- Superficies: verdes claros con hairlines.
- Acento: verde bosque.
- Pensado para cafeterías, viveros y marcas naturales.

### `deep-ocean` (Marea)

- Fondo: azul profundo casi negro.
- Superficies: petróleo.
- Acento: turquesa.
- Ideal para tecnología, servicios y marcas frescas.

### `warm-ember` (Brasa)

- Fondo: marrón espresso.
- Superficies: cobre oscuro.
- Acento: durazno cálido.
- Para gastronomía, barberías y marcas de autor.

Ambos temas se implementan **reemplazando tokens** bajo `[data-theme]`; no hay CSS condicional
por tema ni clases `.dark`.

| Tema | Texto/fondo | Texto mutado/fondo | Acento/fondo | Botón primario | Nav |
|---|---|---|---|---|---|
| Bone | 13.36:1 | 5.71:1 | 5.27:1 | 6.49:1 | 14.98:1 |
| Noche | 16.27:1 | 9.96:1 | 9.39:1 | 8.96:1 | 16.85:1 |
| Salvia | 13.79:1 | 5.74:1 | 5.29:1 | 6.34:1 | 14.59:1 |
| Marea | 16.66:1 | 11.17:1 | 10.77:1 | 9.76:1 | 17.28:1 |
| Brasa | 16.19:1 | 10.34:1 | 10.52:1 | 9.94:1 | 16.93:1 |

Ratios medidos con `node scripts/check-contrast.mjs` (AA mínimo 4.5:1 para texto normal).

## Tipografía

- Sans: `--font-sans` (Inter / system UI). Sin CDN: pila del sistema.
- Mono: `--font-mono` para métricas, fechas, badges y números de tarjeta.
- Escala `--text-xs` a `--text-3xl`; títulos con `--leading-tight` y `--tracking-tight`.
- Labels en mayúsculas con `--tracking-label`, tamaño `--text-xs`.

## Espaciado y layout

- Escala `--space-1` a `--space-16`.
- Contenedor `--container`, formularios `--container-form`, lectura `--container-narrow`.
- Navbar sticky de `--nav-height`; en mobile colapsa en dos filas.
- Breakpoints: `900px` y `640px` (CSS no permite custom properties en `@media`, excepción documentada).
- Revisar en 320, 768, 1024 y 1440 px.

## Componentes

- **Button:** primary, secondary, outline, ghost; altura mínima `--space-10`; foco visible.
- **Input/Select/Textarea:** fondo hundido, borde hairline, foco con `--focus-shadow`.
- **Card:** superficie elevada, borde y sombra suave; hover solo si es clickeable.
- **Badge:** estados y metadatos; nunca como único indicador de error.
- **Alert:** color + texto + borde; no reemplaza la validación inline del formulario.
- **Progress:** barra con `--gradient-progress`; el número siempre visible.
- **Loyalty card:** gradiente `--gradient-loyalty`, texto `--loyalty-card-text`, recompensa con acento.
- **QR:** siempre sobre `--qr-surface` (blanco) para que el escáner lea.

## Branding por tenant

- El tenant define `colorPrimary` y `colorSecondary` (`PUT /api/v1/business/me`).
- `ThemeService` aplica `--color-accent`, `--color-accent-hover`, `--color-accent-contrast` y
  `--color-focus` en runtime, **ajustando el color** hasta alcanzar 4.5:1 contra el fondo del tema activo.
- `colorSecondary` se usa como `--loyalty-card-to`; el texto de la tarjeta se recalcula para AA.
- `backgroundUrl` aplica la foto del tenant al `body` con un velo dinámico sobre `--color-bg`;
  así la imagen no compite con el texto ni cambia el contraste medido por el script.
- `backgroundVisibility` (0–100) controla cuánto se ve la foto; `backgroundBlur` (0–24 px) define
  el desenfoque de las superficies de vidrio. El velo mínimo mantiene la legibilidad.
- Cuando hay foto, `html[data-tenant-bg='true']` cambia `--card-bg` a `--glass-surface` y aplica
  `backdrop-filter` a tarjetas, paneles, tablas y modales (glassmorphism).
- `stampIcon` y `rewardIcon` personalizan el sello y el regalo en tarjeta, panel y recompensas.
- Sin branding, rigen los tokens del tema. Al entrar a `/platform` se limpian los overrides.
- Los cambios de tema recalculan el branding (no queda un acento oscuro sobre fondo oscuro).

## Motion

- Duraciones `--dur-fast`, `--dur-base`, `--dur-slow`; easing `--ease-out`.
- Sin animaciones de entrada en cada render; `fade-in` solo en montajes de página.
- `prefers-reduced-motion` reduce animaciones y transiciones a `--dur-reduced`.
- `[data-motion='off']` las desactiva por completo.

## Accesibilidad

- AA verificado por script en ambos temas (texto 4.5:1, UI 3:1).
- `:focus-visible` global con `--color-focus` y `--focus-offset`.
- Contraste del acento corregido automáticamente por tenant.
- Labels asociados, `aria-label` en iconos, `aria-current` en navegación.
- Sin `!important`; sin estados que dependan solo del color.

## Implementación del tema

1. `index.html` ejecuta un script inline **antes del primer paint** que lee
   `localStorage['loyalty.theme']` (`system` o uno de los 5 ids de tema) y setea
   `data-theme` y `data-theme-mode`.
2. `ThemeService.init()` sincroniza estado, escucha `prefers-color-scheme`, migra `light`/`dark`
   viejos y reaplica branding.
3. `ThemeService.setMode()` persiste cualquiera de los 5 temas; `toggle()` alterna claro/oscuro.
4. El selector del navbar muestra los 5 temas + Sistema con muestras de color y `aria-checked`.

Sin el script inline habría flash del tema incorrecto (FOUC) en cada recarga.

## Gobernanza de tokens

1. Un valor nuevo entra primero como global, luego semántico, luego componente.
2. Ningún componente usa hex/rgba/px de color directamente: **tokens.css es el único archivo con colores**.
3. Si falta un estado, se agrega el token semántico y se documenta acá.
4. Todo cambio de tokens se valida en ambos temas y con `node scripts/check-contrast.mjs`.

## Estados de producto

- **Vacío:** explicar qué falta y cuál es la acción siguiente.
- **Cargando:** texto breve o skeleton; no spinner infinito sin contexto.
- **Error:** mensaje humano, sin datos falsos, con reintento cuando aplica.
- **Sin permisos:** explicar el rol requerido; no redirigir en silencio.
