FIX 10 — Customer Card: Aplicar tema del
admin
Complemento al documento de correcciones v2
Marzo 2026
FIX 10 — Customer Card no respeta la configuración de
apariencia del admin
Diagnóstico completo
El problema tiene DOS capas independientes:
Capa 1 — El SCSS de customer-card usa colores hardcodeados
El archivo customer-card.component.scss tiene todos los estilos de la pantalla (loyalty-card-hero, stamp-cell,
progress-fill, bonus-fill, tab-nav, bottom-nav, etc.) escritos con colores fijos en hexadecimal o con valores RGB
literales, en vez de usar las CSS variables del design system (--primary, --accent, --surface, etc.).
Por ejemplo, el gradiente del fondo de la tarjeta de fidelidad está hardcodeado como:
/* ACTUAL — hardcodeado: */
background: linear-gradient(135deg, #1a2a4a 0%, #0d1b2e 55%, #0a0a1a 100%);
/* CORRECTO — usando variables del tema: */
background: linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary)
80%, black) 100%);
Capa 2 — El ThemeService ya aplica las variables CSS globales correctamente
El ThemeService.apply() sí setea --primary, --secondary, --accent, --bg, --surface, etc. en :root. El problema NO es
el servicio sino que el SCSS del customer-card sobreescribe esas variables con valores fijos usando selectores de
mayor especificidad o propiedades inline, haciendo que los cambios del admin no se vean reflejados.
ℹ️ El resto de la app (admin-dashboard, fidelity-tiers, etc.) sí respeta el tema porque usa las clases globales de
styles.css (.card, .btn, .badge) que ya referencian las CSS variables. El customer-card tiene su propio SCSS
completamente custom y aislado.
Solución — Reemplazar customer-card.component.scss completo
Reemplazar todos los colores hardcodeados por CSS variables del sistema de diseño. Los elementos clave a
corregir son:
• loyalty-card-hero (fondo de la tarjeta): usar var(--secondary) y var(--primary) en vez de #1a2a4a, #0d1b2e
• stamp-cell filled: usar var(--accent) / var(--gold) en vez de colores gold fijos
• progress-fill: usar var(--primary) en vez de color hardcodeado
• bonus-fill: usar var(--accent) en vez de gold fijo
• tab-nav / tab-active: usar var(--primary) y var(--surface)
• bottom-nav: ya usa variables globales, no necesita cambios
• qr-fab / redeem-btn: usar var(--primary)
• glass-card: usar var(--surface) con var(--border)
📄 ARCHIVO: frontend/src/app/pages/customer-card/customer-card.component.scss
REEMPLAZAR el contenido completo del archivo por:
/* ══════════════════════════════════════════════════════════════════
CUSTOMER CARD — Estilos que respetan el tema configurado por admin
Todos los colores usan CSS variables de theme.service.ts → apply()
══════════════════════════════════════════════════════════════════ */
/* ── Shell ────────────────────────────────────────────────────── */
.wallet-shell {
min-height: 100vh;
background: transparent;
padding-top: calc(var(--nav-height, 60px) + 8px);
padding-bottom: calc(var(--bottom-nav-h, 68px) + var(--safe-bottom, 0px) + 16px);
display: flex;
flex-direction: column;
gap: 12px;
padding-left: 16px;
padding-right: 16px;
}
/* ── Loading / Error ─────────────────────────────────────────── */
.loading-screen {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
min-height: 60vh;
gap: 16px;
}
.loader-ring {
width: 44px; height: 44px;
border: 3px solid var(--border);
border-top-color: var(--primary);
border-radius: 50%;
animation: spin 0.75s linear infinite;
}
.loader-label { color: var(--text-muted); font-size: 0.875rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-banner {
display: flex; align-items: center; justify-content: space-between;
gap: 12px; padding: 12px 16px;
background: rgba(239,71,111,0.1);
border: 1px solid rgba(239,71,111,0.25);
border-radius: var(--r-md);
color: var(--danger, #EF476F);
font-size: 0.875rem;
}
.error-banner button { background: none; border: none; cursor: pointer; color: inherit; fontsize: 1rem; }
/* ── Toast ───────────────────────────────────────────────────── */
.toast {
padding: 12px 16px;
border-radius: var(--r-md);
font-size: 0.875rem;
font-weight: 500;
animation: slideDown 0.3s ease;
}
.toast-success {
background: rgba(6,214,160,0.12);
color: var(--success, #06D6A0);
border: 1px solid rgba(6,214,160,0.25);
}
@keyframes slideDown {
from { opacity:0; transform: translateY(-8px); }
to { opacity:1; transform: translateY(0); }
}
/* ── Wallet Header ───────────────────────────────────────────── */
.wallet-header {
display: flex;
align-items: center;
justify-content: space-between;
padding: 4px 0 8px;
}
.header-greeting { display: flex; flex-direction: column; gap: 2px; }
.greeting-label {
font-size: 0.72rem;
text-transform: uppercase;
letter-spacing: 1px;
color: var(--text-muted);
font-weight: 600;
}
.greeting-name {
font-family: var(--font-display);
font-size: 1.25rem;
font-weight: 800;
color: var(--text-heading);
}
.qr-fab {
display: flex; flex-direction: column; align-items: center; gap: 3px;
background: var(--primary);
color: white;
border: none;
border-radius: var(--r-md);
padding: 10px 14px;
cursor: pointer;
font-size: 0.6rem;
font-weight: 700;
letter-spacing: 0.5px;
text-transform: uppercase;
transition: all 0.2s;
box-shadow: 0 4px 14px var(--primary-glow, rgba(0,0,0,0.2));
}
.qr-fab svg { width: 22px; height: 22px; }
.qr-fab:hover { transform: translateY(-1px); filter: brightness(1.1); }
/* ── Loyalty Card Hero ───────────────────────────────────────── */
/* Usa var(--secondary) como color base del fondo de la tarjeta. */
/* Si el admin elige un secondary color oscuro, la tarjeta se verá */
/* en ese tono. Si elige uno claro, se adaptará automáticamente. */
.loyalty-card-hero {
border-radius: var(--r-xl);
padding: 24px 20px 18px;
color: white;
position: relative;
overflow: hidden;
box-shadow: 0 16px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.07) inset;
/* ✅ FIX: fondo basado en var(--secondary) del tema del admin */
background: linear-gradient(
135deg,
var(--secondary) 0%,
color-mix(in srgb, var(--secondary) 70%, #000000) 60%,
color-mix(in srgb, var(--secondary) 45%, #000000) 100%
);
}
/* Glow decorativo usando el color primario del tema */
.loyalty-card-hero::before {
content: '';
position: absolute; top: -40%; right: -15%;
width: 200px; height: 200px;
background: radial-gradient(circle, var(--primary-glow, rgba(255,107,53,0.15)) 0%,
transparent 70%);
pointer-events: none;
}
/* Línea inferior del color accent/gold del tema */
.loyalty-card-hero::after {
content: '';
position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
background: linear-gradient(90deg, transparent, var(--accent), transparent);
opacity: 0.6;
}
.card-chip {
display: flex; gap: 5px; margin-bottom: 16px;
}
.chip-dot {
width: 8px; height: 8px; border-radius: 50%;
background: rgba(255,255,255,0.35);
}
.card-brand {
font-size: 0.68rem;
text-transform: uppercase;
letter-spacing: 2px;
opacity: 0.55;
margin-bottom: 4px;
}
.card-reward-label {
font-family: var(--font-display);
font-size: 1rem;
font-weight: 700;
opacity: 0.85;
margin-bottom: 18px;
}
/* ── Stamp Grid ──────────────────────────────────────────────── */
.stamp-grid {
display: grid;
grid-template-columns: repeat(5, 1fr);
gap: 7px;
margin-bottom: 14px;
}
.stamp-cell {
aspect-ratio: 1;
border-radius: var(--r-sm);
display: flex; align-items: center; justify-content: center;
font-size: 1rem;
border: 1.5px solid rgba(255,255,255,0.12);
background: rgba(255,255,255,0.05);
transition: all 0.25s;
}
/* ✅ FIX: stamp filled usa var(--accent) del tema en vez de gold fijo */
.stamp-filled {
background: color-mix(in srgb, var(--accent) 20%, transparent);
border-color: color-mix(in srgb, var(--accent) 50%, transparent);
box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 30%, transparent);
animation: stampPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
}
.stamp-empty {
color: rgba(255,255,255,0.2);
font-size: 0.65rem;
}
.stamp-icon { font-size: 1.1rem; }
.stamp-num { font-size: 0.65rem; opacity: 0.4; }
@keyframes stampPop {
from { transform: scale(0.5); opacity: 0; }
to { transform: scale(1); opacity: 1; }
}
/* ── Progress bar de sellos ──────────────────────────────────── */
.progress-track {
height: 5px;
background: rgba(255,255,255,0.12);
border-radius: 99px;
overflow: hidden;
margin-bottom: 12px;
}
/* ✅ FIX: barra de progreso usa var(--primary) del tema */
.progress-fill {
height: 100%; border-radius: 99px;
background: var(--primary);
box-shadow: 0 0 8px var(--primary-glow, rgba(255,107,53,0.4));
transition: width 0.7s cubic-bezier(0.16,1,0.3,1);
}
.card-footer-row {
display: flex; align-items: center; justify-content: space-between;
font-size: 0.78rem; opacity: 0.75;
margin-bottom: 8px;
}
.stamp-count { font-weight: 600; }
.stamp-away { opacity: 0.7; }
.reward-ready-badge {
font-size: 0.78rem; font-weight: 700;
/* ✅ FIX: color del badge de recompensa lista usa var(--accent) */
color: var(--accent);
}
.card-completed-row {
display: flex; align-items: center; gap: 6px;
font-size: 0.72rem; opacity: 0.55;
}
.card-completed-row svg { width: 14px; height: 14px; opacity: 0.7; }
/* ── Glass card (bonus block) ────────────────────────────────── */
.glass-card {
/* ✅ FIX: usa var(--surface) y var(--border) del tema */
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--r-lg);
padding: 16px;
box-shadow: var(--shadow-sm);
}
/* ── Bonus block ─────────────────────────────────────────────── */
.bonus-block { }
.bonus-header {
display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.bonus-icon { font-size: 1.5rem; flex-shrink: 0; }
.bonus-title {
font-family: var(--font-display);
font-size: 0.85rem; font-weight: 700;
color: var(--text-heading);
}
.bonus-desc { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.bonus-cards-left {
margin-left: auto; font-size: 0.75rem; font-weight: 700;
/* ✅ FIX: usa var(--accent) en vez de gold hardcodeado */
color: var(--accent);
flex-shrink: 0;
}
.bonus-track {
height: 8px;
background: var(--border);
border-radius: 99px; overflow: hidden; margin-bottom: 8px;
}
/* ✅ FIX: barra de bonus usa var(--accent) del tema */
.bonus-fill {
height: 100%; border-radius: 99px;
background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%,
white));
box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
transition: width 0.7s cubic-bezier(0.16,1,0.3,1);
position: relative;
}
.gold-fill { /* alias para compatibilidad con el HTML existente */ }
.bonus-fill-glow {
position: absolute; right: 0; top: 50%; transform: translateY(-50%);
width: 10px; height: 10px; border-radius: 50%;
background: white; opacity: 0.6;
box-shadow: 0 0 6px 2px var(--accent);
}
.bonus-meta {
display: flex; justify-content: space-between;
font-size: 0.72rem; color: var(--text-muted);
}
/* ── Tab Nav ─────────────────────────────────────────────────── */
.tab-nav {
display: flex; gap: 4px;
/* ✅ FIX: usa var(--surface) y var(--border) del tema */
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--r-lg);
padding: 4px;
}
.tab-btn {
flex: 1; padding: 9px 8px;
border: none; border-radius: var(--r-md);
background: transparent;
color: var(--text-secondary);
font-family: var(--font-body);
font-size: 0.8rem; font-weight: 600;
cursor: pointer;
transition: all 0.2s;
display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tab-btn:hover { color: var(--text-primary); }
/* ✅ FIX: tab activo usa var(--primary) del tema */
.tab-active {
background: var(--primary) !important;
color: white !important;
box-shadow: 0 2px 8px var(--primary-glow, rgba(0,0,0,0.2));
}
.badge {
background: rgba(255,255,255,0.25);
color: white;
font-size: 0.65rem; font-weight: 700;
padding: 1px 6px; border-radius: 99px;
min-width: 18px; text-align: center;
}
.badge-gold {
/* ✅ FIX: badge gold usa var(--accent) */
background: color-mix(in srgb, var(--accent) 20%, transparent);
color: var(--accent);
border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}
/* ── Tab panels ──────────────────────────────────────────────── */
.tab-panel { }
.empty-state { text-align: center; padding: 32px 16px; color: var(--text-muted); }
.empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
.empty-sub { font-size: 0.8rem; margin-top: 6px; color: var(--text-muted); }
/* Activity list */
.activity-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction:
column; gap: 8px; }
.activity-item { display: flex; align-items: center; gap: 12px; padding: 12px; }
.activity-icon {
width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
/* ✅ FIX: fondo del icono usa var(--primary-light) */
background: var(--primary-light);
display: flex; align-items: center; justify-content: center; font-size: 1rem;
}
.activity-body { flex: 1; min-width: 0; }
.activity-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); display:
block; }
.activity-note { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top:
2px; }
.activity-time { font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0; }
/* Rewards */
.rewards-group { margin-bottom: 16px; }
.group-label {
font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px;
color: var(--text-muted); font-weight: 700; margin-bottom: 8px;
}
.reward-card {
margin-bottom: 8px; position: relative; overflow: hidden;
}
.reward-card-inner {
display: flex; align-items: center; gap: 12px; position: relative; z-index: 1;
}
.reward-emoji { font-size: 1.5rem; flex-shrink: 0; }
.reward-body { flex: 1; min-width: 0; }
.reward-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); display:
block; }
.reward-date { font-size: 0.72rem; color: var(--text-muted); display: block; margin-top:
2px; }
.reward-status-label { font-size: 0.72rem; color: var(--text-muted); display: block; margintop: 2px; }
/* ✅ FIX: reward-available usa var(--primary-light) y var(--primary) */
.reward-available {
background: var(--surface);
border: 1px solid var(--border);
border-left: 3px solid var(--primary);
}
.reward-pending {
background: var(--surface);
border: 1px solid var(--border);
border-left: 3px solid var(--warning, #FFB703);
opacity: 0.85;
}
.reward-used {
background: var(--surface);
border: 1px solid var(--border);
opacity: 0.5;
}
/* Shimmer decorativo */
.reward-shimmer {
position: absolute; inset: 0;
background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--primary) 5%,
transparent) 50%, transparent 100%);
pointer-events: none;
}
.shimmer-gold {
background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 5%,
transparent) 50%, transparent 100%);
}
/* Redeem button */
/* ✅ FIX: redeem-btn usa var(--primary) del tema */
.redeem-btn {
padding: 8px 16px;
background: var(--primary);
color: white;
border: none; border-radius: var(--r-md);
font-size: 0.8rem; font-weight: 700;
cursor: pointer; flex-shrink: 0;
transition: all 0.2s;
box-shadow: 0 2px 8px var(--primary-glow, rgba(0,0,0,0.2));
}
.redeem-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.redeem-btn:disabled { opacity: 0.5; cursor: not-allowed; }
/* ✅ FIX: redeem-btn-gold usa var(--accent) del tema */
.redeem-btn-gold {
background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%,
white));
color: var(--secondary);
box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent);
}
/* Status pills */
.status-pill {
padding: 4px 10px; border-radius: 99px;
font-size: 0.68rem; font-weight: 700;
text-transform: uppercase; letter-spacing: 0.3px;
flex-shrink: 0;
}
.status-pill.pending {
background: rgba(255,183,3,0.12);
color: var(--warning, #FFB703);
border: 1px solid rgba(255,183,3,0.3);
}
.status-pill.used {
background: var(--border);
color: var(--text-muted);
}
/* Fidelity reward */
.fidelity-reward { }
.fidelity-badge {
position: absolute; top: 8px; right: 8px;
/* ✅ FIX: usa var(--accent) del tema */
background: color-mix(in srgb, var(--accent) 15%, transparent);
color: var(--accent);
border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
font-size: 0.65rem; font-weight: 700;
padding: 2px 8px; border-radius: 99px;
}
/* ── QR Modal ────────────────────────────────────────────────── */
.qr-overlay {
position: fixed; inset: 0;
background: rgba(0,0,0,0.65);
display: flex; align-items: center; justify-content: center;
z-index: 999; padding: 16px;
backdrop-filter: blur(6px);
animation: fadeIn 0.2s ease;
}
.qr-modal {
/* ✅ FIX: usa var(--surface) del tema */
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--r-xl);
padding: 28px 24px;
max-width: 320px; width: 100%;
text-align: center;
box-shadow: 0 24px 64px rgba(0,0,0,0.35);
position: relative;
animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.qr-modal-close {
position: absolute; top: 12px; right: 12px;
background: var(--surface-2, var(--border));
border: none; border-radius: 50%;
width: 28px; height: 28px;
display: flex; align-items: center; justify-content: center;
cursor: pointer; font-size: 0.9rem;
color: var(--text-muted);
transition: all 0.2s;
}
.qr-modal-close:hover { color: var(--text-primary); }
.qr-modal-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
color: var(--text-heading); margin-bottom: 4px; }
.qr-modal-sub { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px; }
.qr-frame {
background: white;
border-radius: var(--r-md);
padding: 16px; display: inline-block;
box-shadow: 0 4px 16px rgba(0,0,0,0.12);
margin-bottom: 12px;
}
.qr-image { width: 180px; height: 180px; display: block; }
.qr-placeholder { width: 180px; height: 180px; display: flex; align-items: center; justifycontent: center; }
.qr-code-text { font-size: 0.72rem; color: var(--text-muted); font-family: monospace; margintop: 4px; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalPop {
from { opacity: 0; transform: scale(0.88) translateY(16px); }
to { opacity: 1; transform: scale(1) translateY(0); }
}
/* ── Bottom Nav ──────────────────────────────────────────────── */
/* La bottom-nav ya usa las clases globales de styles.css */
/* que respetan las CSS variables. Solo sobreescribir lo necesario */
.bottom-nav {
position: fixed; bottom: 0; left: 0; right: 0;
height: calc(var(--bottom-nav-h, 68px) + var(--safe-bottom, 0px));
padding-bottom: var(--safe-bottom, 0px);
display: flex; align-items: stretch;
background: rgba(8,8,18,0.95);
backdrop-filter: blur(20px);
border-top: 1px solid rgba(255,255,255,0.07);
z-index: 150;
box-shadow: 0 -8px 32px rgba(0,0,0,0.3);
}
.bottom-nav-item {
flex: 1; display: flex; flex-direction: column;
align-items: center; justify-content: center; gap: 3px;
padding: 8px 4px;
background: none; border: none;
color: rgba(255,255,255,0.4);
font-size: 0.58rem; font-weight: 600;
letter-spacing: 0.5px; text-transform: uppercase;
cursor: pointer; text-decoration: none; position: relative;
transition: color 0.2s ease; min-height: 56px;
}
.bottom-nav-item svg { width: 22px; height: 22px; transition: transform 0.2s; }
/* ✅ FIX: ítem activo de la bottom-nav usa var(--primary) */
.bottom-nav-item.active { color: var(--primary) !important; }
.bottom-nav-item.active svg { transform: translateY(-2px); }
.bottom-nav-item:hover:not(.active) { color: rgba(255,255,255,0.7); }
/* QR center button */
.qr-center-btn { flex: 0 0 64px; color: var(--accent) !important; }
.qr-center-ring {
display: flex; align-items: center; justify-content: center;
width: 48px; height: 48px; border-radius: 50%;
/* ✅ FIX: usa var(--primary) del tema en vez de gold hardcodeado */
background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary)
80%, white) 100%);
box-shadow: 0 4px 20px var(--primary-glow, rgba(0,0,0,0.3));
transition: all 0.2s;
}
.qr-center-ring svg { width: 22px; height: 22px; color: white; stroke: white; }
.qr-center-btn:hover .qr-center-ring { transform: scale(1.08); }
.nav-badge {
position: absolute; top: 6px; right: calc(50% - 18px);
min-width: 16px; height: 16px; padding: 0 4px;
border-radius: 99px;
background: var(--danger, #e74c3c);
color: white; font-size: 0.58rem; font-weight: 700;
display: inline-flex; align-items: center; justify-content: center;
border: 2px solid rgba(8,8,18,0.95);
}
/* ── Responsive ──────────────────────────────────────────────── */
@media (min-width: 768px) {
.bottom-nav { display: none; }
.wallet-shell {
max-width: 480px; margin: 0 auto;
padding-bottom: 48px;
}
}
Notas importantes sobre compatibilidad
⚠️ color-mix() requiere navegadores modernos (Chrome 111+, Firefox 113+, Safari 16.2+). Si necesitás soporte de
navegadores más viejos, reemplazar los color-mix() por valores fijos o usar una variable CSS adicional.
ℹ️ Alternativa sin color-mix() para el fondo de la tarjeta — si querés máxima compatibilidad:
/* En lugar de color-mix(), se puede usar una variable calculada. */
/* Agregar en ThemeService.apply(), después de setear --secondary: */
// En theme.service.ts, dentro del método apply(), agregar:
root.style.setProperty('--card-gradient-start', t.secondaryColor);
// Y usar en el SCSS:
.loyalty-card-hero {
background: linear-gradient(135deg, var(--secondary) 0%, #0a0a1a 100%);
}
/* Esta versión simple siempre funciona y ya usa el tema del admin. */
ℹ️ El botón QR central (qr-center-ring) actualmente usa var(--primary) en esta corrección. En la versión original usaba
el color gold/accent. Podés cambiarlo a var(--accent) si preferís que use el color de acento del tema:
/* Opción con accent en vez de primary para el QR button: */
.qr-center-ring {
background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 80%,
white) 100%);
box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent);
}
.qr-center-ring svg { color: var(--secondary); stroke: var(--secondary); }
Resumen de qué cambia visualmente
Elemento Antes (hardcodeado) Después (usa tema)
Fondo tarjeta #1a2a4a → #0a0a1a var(--secondary) con
gradiente
Brillo decorativo rgba(251,197,49,0.1) fijo var(--primary-glow) del tema
Línea inferior var(--gold) fijo var(--accent) del tema
Stamps llenos rgba(251,197,49,0.16) fijo color-mix(accent 20%,
transparent)
Barra progreso var(--primary) ya
correcto
var(--primary) (sin cambio)
Barra bonus #fbc531 → #ffd369 fijo var(--accent) del tema
Tab activo #FF6B35 fijo o similar var(--primary) del tema
Botón Redeem color fijo var(--primary) del tema
Botón Claim gold gold fijo var(--accent) del tema
Elemento Antes (hardcodeado) Después (usa tema)
QR center ring gold/var(--gold) fijo var(--primary) del tema
Bottom nav activo color fijo var(--primary) del tema
Glass card / modal rgba fijos var(--surface) + var(--
border)
FIX 10 — Complemento al documento loyalty_app_correcciones_v2.docx
