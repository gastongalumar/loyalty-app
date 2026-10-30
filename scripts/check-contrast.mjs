#!/usr/bin/env node
// Verifica contraste AA de los tokens en ambos temas, sin dependencias.
// Uso: node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';

const CSS_PATH = 'frontend/src/styles/tokens.css';
const css = readFileSync(CSS_PATH, 'utf8');

function block(marker) {
  const start = css.indexOf(marker);
  if (start === -1) throw new Error(`No se encontro el bloque ${marker}`);
  const open = css.indexOf('{', start);
  const end = css.indexOf('\n}', open);
  return css.slice(open + 1, end);
}

function parseVars(source) {
  const vars = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = re.exec(source)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

const light = parseVars(block(':root'));

const themes = [
  ['light-neumorphic', light],
  ['dark-purple', { ...light, ...parseVars(block("[data-theme='dark-purple']")) }],
  ['sage-mist', { ...light, ...parseVars(block("[data-theme='sage-mist']")) }],
  ['deep-ocean', { ...light, ...parseVars(block("[data-theme='deep-ocean']")) }],
  ['warm-ember', { ...light, ...parseVars(block("[data-theme='warm-ember']")) }]
];

function resolve(theme, name, depth = 0) {
  if (depth > 10) return null;
  const value = theme[name];
  if (!value) return null;
  const reference = value.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (reference) return resolve(theme, reference[1], depth + 1);
  return value;
}

function parseColor(value) {
  if (!value) return null;
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let raw = hex[1];
    if (raw.length === 3) raw = raw.split('').map(c => c + c).join('');
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
      a: 1
    };
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4])
    };
  }
  return null;
}

function composite(fg, bg) {
  if (!fg) return null;
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1
  };
}

function luminance(color) {
  const channels = [color.r, color.g, color.b].map(channel => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const pairs = [
  ['texto / fondo', 'color-text', 'color-bg', 4.5],
  ['texto / superficie', 'color-text', 'color-surface', 4.5],
  ['texto / superficie elevada', 'color-text', 'color-surface-raised', 4.5],
  ['texto mutado / fondo', 'color-text-muted', 'color-bg', 4.5],
  ['texto mutado / superficie', 'color-text-muted', 'color-surface', 4.5],
  ['texto sutil / fondo', 'color-text-subtle', 'color-bg', 4.5],
  ['acento / fondo', 'color-accent', 'color-bg', 4.5],
  ['acento / superficie', 'color-accent', 'color-surface-raised', 4.5],
  ['texto sobre boton primario', 'color-accent-contrast', 'color-accent', 4.5],
  ['nav texto / nav fondo', 'color-nav-text', 'color-nav-bg', 4.5],
  ['nav texto mutado / nav fondo', 'color-nav-text-muted', 'color-nav-bg', 4.5],
  ['exito / exito suave', 'color-success', 'color-success-soft', 4.5],
  ['warning / warning suave', 'color-warning', 'color-warning-soft', 4.5],
  ['peligro / peligro suave', 'color-danger', 'color-danger-soft', 4.5],
  ['tarjeta texto / tarjeta from', 'loyalty-card-text', 'loyalty-card-from', 4.5],
  ['tarjeta texto / tarjeta to', 'loyalty-card-text', 'loyalty-card-to', 4.5],
  ['tarjeta acento / tarjeta from', 'loyalty-card-accent', 'loyalty-card-from', 4.5]
];

let failures = 0;

for (const [themeName, theme] of themes) {
  console.log(`\n${themeName}`);
  console.log('-'.repeat(56));
  for (const [label, fgName, bgName, min] of pairs) {
    const bgRaw = parseColor(resolve(theme, bgName));
    let fgRaw = parseColor(resolve(theme, fgName));
    if (!bgRaw || !fgRaw) {
      console.log(`SKIP  ${label} (valor no soportado)`);
      continue;
    }
    // Si el fondo es translucido, se compone sobre color-bg.
    const base = parseColor(resolve(theme, 'color-bg'));
    const bg = composite(bgRaw, base);
    if (fgRaw.a < 1) fgRaw = composite(fgRaw, bg);
    const ratio = contrast(fgRaw, bg);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}: ${ratio.toFixed(2)}:1 (min ${min})`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures} par(es) por debajo de AA`);
  process.exit(1);
}
console.log('Todos los pares cumplen AA');
