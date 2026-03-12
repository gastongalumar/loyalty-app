import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'colorful';

export interface AppTheme {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
  logoPosition: 'top-left' | 'centered' | 'header';
  backgroundUrl: string;
  backgroundSize: 'cover' | 'contain';
  backgroundBlur: boolean;
}

const DEFAULT_THEME: AppTheme = {
  mode: 'light',
  primaryColor: '#FF6B35',
  secondaryColor: '#1A1A2E',
  accentColor: '#FFD166',
  fontFamily: 'Syne',
  logoUrl: '',
  logoPosition: 'header',
  backgroundUrl: '',
  backgroundSize: 'cover',
  backgroundBlur: false,
};

const THEME_PRESETS: Record<ThemeMode, Partial<AppTheme>> = {
  light: {
    primaryColor: '#FF6B35',
    secondaryColor: '#1A1A2E',
    accentColor: '#FFD166',
  },
  dark: {
    primaryColor: '#7C6AF7',
    secondaryColor: '#0D0D1A',
    accentColor: '#00E5FF',
  },
  colorful: {
    primaryColor: '#E040FB',
    secondaryColor: '#1DE9B6',
    accentColor: '#FFAB40',
  },
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme: AppTheme = { ...DEFAULT_THEME };

  constructor() {
    this.load();
  }

  getTheme(): AppTheme {
    return { ...this.theme };
  }

  applyTheme(partial: Partial<AppTheme>): void {
    this.theme = { ...this.theme, ...partial };
    this.apply();
    this.save();
  }

  applyPreset(mode: ThemeMode): void {
    const preset = THEME_PRESETS[mode];
    this.theme = { ...this.theme, ...preset, mode };
    this.apply();
    this.save();
  }

  resetDefaults(): void {
    this.theme = { ...DEFAULT_THEME };
    this.apply();
    this.save();
  }

  private apply(): void {
    const root = document.documentElement;
    const t = this.theme;

    root.setAttribute('data-theme', t.mode);
    root.style.setProperty('--primary', t.primaryColor);
    root.style.setProperty('--primary-dark', this.darken(t.primaryColor, 15));
    root.style.setProperty('--primary-light', this.lighten(t.primaryColor, 90));
    root.style.setProperty('--secondary', t.secondaryColor);
    root.style.setProperty('--accent', t.accentColor);

    if (t.mode === 'dark') {
      root.style.setProperty('--bg', '#0D0D1A');
      root.style.setProperty('--surface', '#16162A');
      root.style.setProperty('--surface-2', '#1E1E35');
      root.style.setProperty('--border', '#2A2A45');
      root.style.setProperty('--text-primary', '#F0F0FF');
      root.style.setProperty('--text-secondary', '#9090B0');
      root.style.setProperty('--text-muted', '#5A5A80');
    } else {
      root.style.setProperty('--bg', '#F8F7F4');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--surface-2', '#F3F2EF');
      root.style.setProperty('--border', '#E8E6E1');
      root.style.setProperty('--text-primary', '#1A1A2E');
      root.style.setProperty('--text-secondary', '#6B6B7B');
      root.style.setProperty('--text-muted', '#9B9BAB');
    }

    // Font
    const fontMap: Record<string, string> = {
      'Syne': "'Syne', sans-serif",
      'DM Sans': "'DM Sans', sans-serif",
      'Outfit': "'Outfit', sans-serif",
      'Space Grotesk': "'Space Grotesk', sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
    };
    root.style.setProperty('--font-display', fontMap[t.fontFamily] || fontMap['Syne']);

    // Background
    const body = document.body;
    if (t.backgroundUrl) {
      body.style.backgroundImage = t.backgroundBlur
        ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${t.backgroundUrl}')`
        : `url('${t.backgroundUrl}')`;
      body.style.backgroundSize = t.backgroundSize;
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.backgroundImage = '';
    }
  }

  private save(): void {
    localStorage.setItem('app-theme', JSON.stringify(this.theme));
  }

  private load(): void {
    const saved = localStorage.getItem('app-theme');
    if (saved) {
      try {
        this.theme = { ...DEFAULT_THEME, ...JSON.parse(saved) };
      } catch {
        this.theme = { ...DEFAULT_THEME };
      }
    }
    this.apply();
  }

  // Simple color helpers
  private darken(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private lighten(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * (percent / 100)));
    return `#${((mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).padStart(6, '0')}`;
  }
}
