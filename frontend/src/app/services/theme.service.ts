import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TenantInfo } from '../models/models';
import { mediaUrl } from '../utils/media-url';

export type ThemeId =
  | 'light-neumorphic'
  | 'dark-purple'
  | 'sage-mist'
  | 'deep-ocean'
  | 'warm-ember';

export type ThemeMode = ThemeId | 'system';

export interface ThemeOption {
  id: ThemeMode;
  labelKey: string;
}

const DARK_THEMES: ThemeId[] = ['dark-purple', 'deep-ocean', 'warm-ember'];
const THEME_IDS: ThemeId[] = [
  'light-neumorphic',
  'dark-purple',
  'sage-mist',
  'deep-ocean',
  'warm-ember'
];

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light-neumorphic', labelKey: 'THEME.BONE' },
  { id: 'dark-purple', labelKey: 'THEME.NIGHT' },
  { id: 'sage-mist', labelKey: 'THEME.SAGE' },
  { id: 'deep-ocean', labelKey: 'THEME.OCEAN' },
  { id: 'warm-ember', labelKey: 'THEME.EMBER' },
  { id: 'system', labelKey: 'THEME.SYSTEM' }
];

const STORAGE_KEY = 'loyalty.theme';
const BRAND_VARS = [
  '--color-accent',
  '--color-accent-hover',
  '--color-accent-contrast',
  '--color-focus',
  '--loyalty-card-to',
  '--loyalty-card-text',
  '--loyalty-card-muted'
];

/**
 * Dos responsabilidades, un solo servicio:
 *  1. tema de la app (light-neumorphic / dark-purple) con persistencia y anti-FOUC;
 *  2. branding del tenant (acento + tarjeta), recalculado al cambiar de tema.
 *
 * El anti-FOUC real vive en index.html: un script inline aplica data-theme antes
 * del primer paint. Este servicio sincroniza estado, listeners y contraste.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly isDark$ = new BehaviorSubject<boolean>(false);

  private mode: ThemeMode = 'system';
  private tenant: TenantInfo | null = null;
  private media: MediaQueryList | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.mode = this.readMode();

    if (typeof window.matchMedia === 'function') {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', () => {
        if (this.mode === 'system') {
          this.applyResolved();
        }
      });
    }

    this.applyResolved();
  }

  getMode(): ThemeMode {
    return this.mode;
  }

  isDark(): boolean {
    const current = document.documentElement.dataset['theme'] as ThemeId | undefined;
    return current ? DARK_THEMES.includes(current) : false;
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage puede estar bloqueado; el tema sigue funcionando en memoria
    }
    this.applyResolved();
  }

  toggle(): void {
    this.setMode(this.isDark() ? 'light-neumorphic' : 'dark-purple');
  }

  /** Aplica (o limpia) el branding del tenant. */
  apply(info: TenantInfo | null): void {
    this.tenant = info;
    this.applyBranding();
    this.applyBackground();
  }

  reset(): void {
    this.tenant = null;
    this.clearBranding();
    this.applyBackground();
  }

  private applyResolved(): void {
    const resolved = this.resolveTheme();
    document.documentElement.dataset['theme'] = resolved;
    document.documentElement.dataset['themeMode'] = this.mode;
    this.isDark$.next(DARK_THEMES.includes(resolved));
    this.applyBranding();
    this.applyBackground();
  }

  private resolveTheme(): ThemeId {
    if (this.mode === 'system') {
      return this.media?.matches ? 'dark-purple' : 'light-neumorphic';
    }
    return this.mode;
  }

  private readMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light') {
        return 'light-neumorphic';
      }
      if (saved === 'dark') {
        return 'dark-purple';
      }
      if (saved === 'system' || (saved && THEME_IDS.includes(saved as ThemeId))) {
        return saved as ThemeMode;
      }
    } catch {
      // ignore
    }
    return 'system';
  }

  private applyBranding(): void {
    const root = document.documentElement;

    if (!this.tenant || !this.tenant.colorPrimary) {
      this.clearBranding();
      return;
    }

    const background = this.readToken('--color-bg');
    if (!background) {
      this.clearBranding();
      return;
    }
    const accent = this.ensureContrast(this.tenant.colorPrimary, background, 4.5);

    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-accent-hover',
      this.adjust(accent, this.isDark() ? 18 : -18));
    root.style.setProperty('--color-accent-contrast', this.readableOn(accent));
    root.style.setProperty('--color-focus', this.ensureContrast(accent, background, 3));

    if (this.tenant.colorSecondary) {
      root.style.setProperty('--loyalty-card-to', this.tenant.colorSecondary);
      root.style.setProperty('--loyalty-card-text', this.readableOn(this.tenant.colorSecondary));
      root.style.setProperty('--loyalty-card-muted',
        'color-mix(in srgb, var(--loyalty-card-text) 68%, transparent)');
    }
  }

  private clearBranding(): void {
    const root = document.documentElement;
    BRAND_VARS.forEach(variable => root.style.removeProperty(variable));
  }

  /**
   * La foto de fondo vive en el body para que cubra todas las pantallas del
   * tenant. Se compone con un velo del color base para no romper el contraste.
   */
  private applyBackground(): void {
    const body = document.body;
    const root = document.documentElement;
    const rawUrl = this.tenant?.backgroundUrl?.trim();

    if (!rawUrl) {
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-size');
      body.style.removeProperty('background-attachment');
      body.style.removeProperty('background-position');
      body.style.removeProperty('background-repeat');
      root.dataset['tenantBg'] = 'false';
      root.style.removeProperty('--tenant-glass-blur');
      root.style.removeProperty('--tenant-glass-overlay');
      return;
    }

    const visibility = this.clampInt(this.tenant?.backgroundVisibility ?? 20, 0, 100);
    const blur = this.clampInt(this.tenant?.backgroundBlur ?? 8, 0, 24);
    const overlay = Math.round(96 - visibility * 0.42);
    const safeUrl = encodeURI(mediaUrl(rawUrl)).replace(/"/g, '%22');
    const veil = `color-mix(in srgb, var(--color-bg) ${overlay}%, transparent)`;

    body.style.backgroundImage =
      `var(--page-wash), linear-gradient(${veil}, ${veil}), url("${safeUrl}")`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';

    root.dataset['tenantBg'] = 'true';
    root.style.setProperty('--tenant-glass-blur', `${blur}px`);
    root.style.setProperty('--tenant-glass-overlay', `${overlay}%`);
  }

  private clampInt(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  }

  private readToken(name: string): string | null {
    // --color-bg y los neutros son hex en ambos temas (tokens.css)
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return this.isHex(value) ? value : null;
  }

  private isHex(value: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  private ensureContrast(hex: string, background: string, target: number): string {
    let color = hex;
    const direction = this.luminance(background) < 0.5 ? 1 : -1;

    for (let i = 0; i < 25 && this.contrast(color, background) < target; i++) {
      color = this.adjust(color, direction * 10);
    }
    return color;
  }

  /** Devuelve el color de texto (claro u oscuro del sistema) con mejor contraste. */
  private readableOn(background: string): string {
    const light = this.readToken('--neutral-0') ?? background;
    const dark = this.readToken('--neutral-950') ?? background;
    return this.contrast(light, background) >= this.contrast(dark, background) ? light : dark;
  }

  private adjust(hex: string, amount: number): string {
    const value = parseInt(hex.slice(1), 16);
    const r = this.clamp((value >> 16) + amount);
    const g = this.clamp(((value >> 8) & 0xff) + amount);
    const b = this.clamp((value & 0xff) + amount);
    return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(b)}`;
  }

  private contrast(a: string, b: string): number {
    const l1 = this.luminance(a);
    const l2 = this.luminance(b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private luminance(hex: string): number {
    const value = parseInt(hex.slice(1), 16);
    const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
      .map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(255, value));
  }

  private toHex(value: number): string {
    return value.toString(16).padStart(2, '0');
  }
}
