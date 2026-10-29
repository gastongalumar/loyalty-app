import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TenantInfo } from '../models/models';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light-neumorphic' | 'dark-purple';

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
    return document.documentElement.dataset['theme'] === 'dark-purple';
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
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  /** Aplica (o limpia) el branding del tenant. */
  apply(info: TenantInfo | null): void {
    this.tenant = info;
    this.applyBranding();
  }

  reset(): void {
    this.tenant = null;
    this.clearBranding();
  }

  private applyResolved(): void {
    const resolved = this.resolveTheme();
    document.documentElement.dataset['theme'] = resolved;
    document.documentElement.dataset['themeMode'] = this.mode;
    this.isDark$.next(resolved === 'dark-purple');
    this.applyBranding();
  }

  private resolveTheme(): ResolvedTheme {
    if (this.mode === 'light') {
      return 'light-neumorphic';
    }
    if (this.mode === 'dark') {
      return 'dark-purple';
    }
    return this.media?.matches ? 'dark-purple' : 'light-neumorphic';
  }

  private readMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
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
