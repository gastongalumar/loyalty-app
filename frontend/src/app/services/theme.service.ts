import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'colorful';

export interface AppTheme {
  id?: number;
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  appName: string;
  logoUrl: string;
  logoSize: number;
  nameSize: number;
  navbarTextColor: string;
  logoPosition: 'top-left' | 'centered' | 'header';
  backgroundUrl: string;
  backgroundSize: 'cover' | 'contain';
  backgroundBlur: boolean;
  cardOpacity: number;
}

const DEFAULT_THEME: AppTheme = {
  mode: 'light',
  primaryColor: '#FF6B35',
  secondaryColor: '#1A1A2E',
  accentColor: '#FFD166',
  fontFamily: 'Syne',
  appName: 'LoyaltyCard',
  logoUrl: '',
  logoSize: 32,
  nameSize: 18,
  navbarTextColor: '#FFFFFF',
  logoPosition: 'header',
  backgroundUrl: '',
  backgroundSize: 'cover',
  backgroundBlur: false,
  cardOpacity: 85,
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme: AppTheme = { ...DEFAULT_THEME };
  private apiUrl = `${environment.apiUrl}/admin/theme`;

  constructor(private http: HttpClient) {
    this.loadFromServer();
  }

  async loadFromServer() {
    try {
      const serverTheme = await firstValueFrom(this.http.get<AppTheme>(this.apiUrl));
      this.theme = { ...DEFAULT_THEME, ...serverTheme };
      this.apply();
    } catch (error) {
      console.error('Error loading theme from server', error);
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
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

  getTheme(): AppTheme {
    return { ...this.theme };
  }

  // SOLO APLICA VISUALMENTE, NO GUARDA
  applyTheme(partial: Partial<AppTheme>): void {
    this.theme = { ...this.theme, ...partial };
    this.apply();
    // Backup en localStorage por si acaso
    localStorage.setItem('app-theme', JSON.stringify(this.theme));
  }

  // GUARDA SOLO LA CONFIGURACIÓN (SIN IMÁGENES)
  saveConfig(): Promise<AppTheme> {
    // Crear una copia SIN las URLs de imágenes
    const configToSave = {
      mode: this.theme.mode,
      primaryColor: this.theme.primaryColor,
      secondaryColor: this.theme.secondaryColor,
      accentColor: this.theme.accentColor,
      fontFamily: this.theme.fontFamily,
      appName: this.theme.appName,
      logoSize: this.theme.logoSize,
      nameSize: this.theme.nameSize,
      navbarTextColor: this.theme.navbarTextColor,
      backgroundSize: this.theme.backgroundSize,
      backgroundBlur: this.theme.backgroundBlur,
      cardOpacity: this.theme.cardOpacity
    };

    return firstValueFrom(this.http.put<AppTheme>(this.apiUrl, configToSave));
  }

  applyPreset(mode: ThemeMode): void {
    const presets = {
      light: { primaryColor: '#FF6B35', secondaryColor: '#1A1A2E', accentColor: '#FFD166' },
      dark: { primaryColor: '#7C6AF7', secondaryColor: '#0D0D1A', accentColor: '#00E5FF' },
      colorful: { primaryColor: '#E040FB', secondaryColor: '#1DE9B6', accentColor: '#FFAB40' },
    };
    this.theme = { ...this.theme, ...presets[mode], mode };
    this.apply();
    // No guardamos automáticamente
  }

  resetDefaults(): void {
    this.theme = { ...DEFAULT_THEME };
    this.apply();
    // No guardamos automáticamente
  }

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.apiUrl}/upload-logo`, formData)
    );

    this.theme.logoUrl = response.url;
    this.apply();
    return response.url;
  }

  async uploadBackground(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.apiUrl}/upload-background`, formData)
    );

    this.theme.backgroundUrl = response.url;
    this.apply();
    return response.url;
  }

  removeLogo() {
    this.http.delete(`${this.apiUrl}/remove-logo`).subscribe({
      next: () => {
        this.theme.logoUrl = '';
        this.apply();
      },
      error: (err) => console.error('Error removing logo', err)
    });
  }

  removeBackground() {
    this.http.delete(`${this.apiUrl}/remove-background`).subscribe({
      next: () => {
        this.theme.backgroundUrl = '';
        this.apply();
      },
      error: (err) => console.error('Error removing background', err)
    });
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
    root.style.setProperty('--navbar-text', t.navbarTextColor);

    const opacity = t.cardOpacity / 100;

    if (t.mode === 'dark') {
      root.style.setProperty('--bg', '#0D0D1A');
      root.style.setProperty('--surface', `rgba(22, 22, 42, ${opacity})`);
      root.style.setProperty('--surface-2', `rgba(30, 30, 53, ${opacity})`);
      root.style.setProperty('--border', '#2A2A45');
      root.style.setProperty('--text-primary', '#F0F0FF');
      root.style.setProperty('--text-secondary', '#9090B0');
      root.style.setProperty('--text-muted', '#5A5A80');
    } else {
      root.style.setProperty('--bg', '#F8F7F4');
      root.style.setProperty('--surface', `rgba(255, 255, 255, ${opacity})`);
      root.style.setProperty('--surface-2', `rgba(243, 242, 239, ${opacity})`);
      root.style.setProperty('--border', '#E8E6E1');
      root.style.setProperty('--text-primary', '#1A1A2E');
      root.style.setProperty('--text-secondary', '#6B6B7B');
      root.style.setProperty('--text-muted', '#9B9BAB');
    }

    const fontMap: Record<string, string> = {
      'Syne': "'Syne', sans-serif",
      'DM Sans': "'DM Sans', sans-serif",
      'Outfit': "'Outfit', sans-serif",
      'Space Grotesk': "'Space Grotesk', sans-serif",
      'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
    };
    root.style.setProperty('--font-display', fontMap[t.fontFamily] || fontMap['Syne']);

    if (t.backgroundUrl) {
      // Usar getImageUrl para la URL del background
      const bgUrl = this.getImageUrl(t.backgroundUrl);
      const bgValue = t.backgroundBlur
        ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${bgUrl}')`
        : `url('${bgUrl}')`;

      root.style.backgroundImage = bgValue;
      root.style.backgroundSize = t.backgroundSize;
      root.style.backgroundAttachment = 'fixed';
      root.style.backgroundPosition = 'center';
      root.style.backgroundRepeat = 'no-repeat';
    } else {
      root.style.backgroundImage = '';
    }
  }

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

  // Helper para construir URLs completas de imágenes usando FileController
  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) {
      // Extraer tipo (logos/backgrounds) y nombre del archivo
      const parts = path.split('/');
      const type = parts[2]; // "logos" o "backgrounds"
      const filename = parts[3];
      // Usar el endpoint del FileController
      return `http://localhost:8081/api/files/${type}/${filename}`;
    }
    return path;
  }
}
