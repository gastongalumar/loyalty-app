import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { ThemeService, AppTheme, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide ap-wrap">
      <div class="page-header">
        <a routerLink="/admin/dashboard" class="page-back">← {{ 'common.back' | translate }}</a>
        <h1 class="page-title">{{ 'appearance.title' | translate }}</h1>
        <p class="page-subtitle">{{ 'appearance.subtitle' | translate }}</p>
      </div>

      <div *ngIf="saved" class="alert alert-success fade-in">✅ {{ 'common.success' | translate }}</div>

      <!-- ── TEMA ─────────────────────────────────── -->
      <div class="ap-card fade-in">
        <div class="ap-section-title">🎨 {{ 'appearance.theme' | translate }}</div>
        <div class="preset-grid">
          <button class="preset-btn" [class.active]="theme.mode === 'light'" (click)="applyPreset('light')">
            ☀️ {{ 'appearance.themeLight' | translate }}
          </button>
          <button class="preset-btn" [class.active]="theme.mode === 'dark'" (click)="applyPreset('dark')">
            🌙 {{ 'appearance.themeDark' | translate }}
          </button>
          <button class="preset-btn" [class.active]="theme.mode === 'colorful'" (click)="applyPreset('colorful')">
            🎨 {{ 'appearance.themeColorful' | translate }}
          </button>
        </div>
      </div>

      <!-- ── COLORES ──────────────────────────────── -->
      <div class="ap-card fade-in">
        <div class="ap-section-title">🖌️ {{ 'appearance.colors' | translate }}</div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.primaryColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">{{ 'appearance.primaryColor' | translate }}</span>
            <code class="color-row-hex">{{ theme.primaryColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.primaryColor"></div>
        </div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.secondaryColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">{{ 'appearance.secondaryColor' | translate }}</span>
            <code class="color-row-hex">{{ theme.secondaryColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.secondaryColor"></div>
        </div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.accentColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">{{ 'appearance.accentColor' | translate }}</span>
            <code class="color-row-hex">{{ theme.accentColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.accentColor"></div>
        </div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.navbarTextColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">Navbar text</span>
            <code class="color-row-hex">{{ theme.navbarTextColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.navbarTextColor"
               style="border:1px solid var(--border)"></div>
        </div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.bodyTextColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">Color texto body</span>
            <code class="color-row-hex">{{ theme.bodyTextColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.bodyTextColor"
               style="border:1px solid var(--border)"></div>
        </div>

        <div class="color-row">
          <input type="color" [(ngModel)]="theme.headingTextColor" (input)="onColorChange()">
          <div class="color-row-info">
            <span class="color-row-label">Color headings</span>
            <code class="color-row-hex">{{ theme.headingTextColor }}</code>
          </div>
          <div class="color-swatch" [style.background]="theme.headingTextColor"
               style="border:1px solid var(--border)"></div>
        </div>
      </div>

      <!-- ── TIPOGRAFÍA ───────────────────────────── -->
      <div class="ap-card fade-in">
        <div class="ap-section-title">✏️ {{ 'appearance.fonts' | translate }}</div>

        <!-- Font picker dropdown-style -->
        <div class="form-group">
          <label class="form-label">Fuente principal</label>
          <div class="font-picker" [class.open]="fontPickerOpen">
            <button class="font-picker-trigger" (click)="fontPickerOpen = !fontPickerOpen" type="button">
              <span [style.fontFamily]="theme.fontFamily">{{ theme.fontFamily }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="font-picker-list" *ngIf="fontPickerOpen">
              <button *ngFor="let f of fonts"
                      class="font-picker-item"
                      [class.selected]="theme.fontFamily === f.name"
                      (click)="selectFont(f.name)"
                      type="button">
                <span class="font-item-name" [style.fontFamily]="f.name">{{ f.name }}</span>
                <span class="font-item-tag">{{ f.tag }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Font size -->
        <div class="form-group">
          <label class="form-label">Tamaño de texto base ({{ theme.bodyFontSize || 16 }}px)</label>
          <input type="range" min="13" max="20" step="1"
                 [(ngModel)]="theme.bodyFontSize" (input)="onColorChange()" class="ap-range">
          <div class="range-labels">
            <span>13px</span><span>16px</span><span>20px</span>
          </div>
        </div>

        <!-- Live preview -->
        <div class="font-preview-box">
          <div class="font-preview-heading" [style.fontFamily]="theme.fontFamily">
            El zorro marrón salta
          </div>
          <div class="font-preview-body">
            Texto de ejemplo para ver cómo se ve la fuente en el sistema.
          </div>
        </div>
      </div>

      <!-- ── BRANDING ─────────────────────────────── -->
      <div class="ap-card fade-in">
        <div class="ap-section-title">🏷️ {{ 'appearance.branding' | translate }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.appName' | translate }}</label>
          <input type="text" class="form-control" [(ngModel)]="theme.appName"
                 (input)="onColorChange()" placeholder="Mi App">
        </div>

        <!-- Logo size — hasta 192px -->
        <div class="form-group">
          <label class="form-label">
            Tamaño del logo
            <span class="size-badge">{{ theme.logoSize }}px</span>
          </label>
          <input type="range" min="24" max="192" step="4"
                 [(ngModel)]="theme.logoSize" (input)="onColorChange()" class="ap-range">
          <div class="range-labels">
            <span>24px</span><span>96px</span><span>192px</span>
          </div>
        </div>

<!-- Login logo size -->
<div class="form-group">
  <label class="form-label">
    Tamaño del logo en Login
    <span class="size-badge">{{ theme.loginLogoSize || 80 }}px</span>
  </label>
  <input type="range" min="40" max="200" step="4"
         [(ngModel)]="theme.loginLogoSize" (input)="onColorChange()" class="ap-range">
  <div class="range-labels">
    <span>40px</span><span>120px</span><span>200px</span>
  </div>
</div>


        <!-- App name size -->
        <div class="form-group">
          <label class="form-label">
            Tamaño nombre app
            <span class="size-badge">{{ theme.nameSize }}px</span>
          </label>
          <input type="range" min="14" max="40" step="1"
                 [(ngModel)]="theme.nameSize" (input)="onColorChange()" class="ap-range">
          <div class="range-labels">
            <span>14px</span><span>28px</span><span>40px</span>
          </div>
        </div>

        <!-- Logo upload -->
        <div class="form-group">
          <label class="form-label">{{ 'appearance.uploadLogo' | translate }}</label>
          <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                 class="form-control" (change)="onLogoUpload($event)">
          <div *ngIf="theme.logoUrl" class="logo-preview-row">
            <img [src]="getImageUrl(theme.logoUrl)"
                 [style.height.px]="Math.min(theme.logoSize, 80)"
                 style="object-fit:contain; border-radius:8px; border:1px solid var(--border); padding:4px; background:white;">
            <button class="btn btn-outline btn-sm" (click)="removeLogo()">🗑️ Quitar</button>
          </div>
        </div>

        <!-- Navbar preview -->
        <div class="navbar-preview">
          <div class="navbar-preview-label">Vista previa navbar</div>
          <div class="navbar-preview-inner" [style.background]="theme.secondaryColor">
            <img *ngIf="theme.logoUrl" [src]="getImageUrl(theme.logoUrl)"
                 [style.width.px]="Math.min(theme.logoSize, 48)"
                 [style.height.px]="Math.min(theme.logoSize, 48)"
                 style="object-fit:contain; flex-shrink:0;">
            <span [style.fontSize.px]="Math.min(theme.nameSize, 22)"
                  [style.fontFamily]="theme.fontFamily"
                  [style.fontWeight]="'800'"
                  [style.color]="theme.navbarTextColor">
              {{ theme.appName || 'LoyaltyCard' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── FONDO ─────────────────────────────────── -->
      <div class="ap-card fade-in">
        <div class="ap-section-title">🖼️ {{ 'appearance.uploadBackground' | translate }}</div>

        <div class="form-group">
          <label class="form-label">Imagen de fondo</label>
          <input type="file" accept="image/*" class="form-control" (change)="onBgUpload($event)">
          <div *ngIf="theme.backgroundUrl" style="margin-top:10px; display:flex; gap:10px; align-items:center;">
            <div class="bg-thumb"
                 [style.backgroundImage]="'url(' + getImageUrl(theme.backgroundUrl) + ')'"></div>
            <button class="btn btn-outline btn-sm" (click)="removeBg()">🗑️ Quitar fondo</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tamaño de fondo</label>
          <select class="form-control" [(ngModel)]="theme.backgroundSize" (change)="onColorChange()">
            <option value="cover">Cover (recortar para llenar)</option>
            <option value="contain">Contain (mostrar completo)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            Transparencia de cards ({{ theme.cardOpacity }}%)
          </label>
          <input type="range" min="0" max="100" step="5"
                 [(ngModel)]="theme.cardOpacity" (input)="onColorChange()" class="ap-range">
          <div class="range-labels">
            <span>Sólido</span><span>50%</span><span>Transparente</span>
          </div>
        </div>

        <div class="ap-checkbox-row">
          <input type="checkbox" id="bgBlur" [(ngModel)]="theme.backgroundBlur" (change)="onColorChange()">
          <label for="bgBlur">{{ 'appearance.bgBlur' | translate }}</label>
        </div>
      </div>

      <!-- ── GUARDAR ───────────────────────────────── -->
      <div class="ap-footer">
        <button class="btn btn-primary" style="flex:1" (click)="save()">
          💾 {{ 'appearance.saveAppearance' | translate }}
        </button>
        <button class="btn btn-outline" (click)="reset()">
          {{ 'appearance.resetDefaults' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ap-wrap {
      padding-top: 24px;
      padding-bottom: 56px;
      max-width: 680px;
    }

    .ap-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 20px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-sm);
    }

    .ap-section-title {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Preset buttons */
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .preset-btn {
      padding: 11px 8px;
      border: 1.5px solid var(--border);
      border-radius: var(--r-md);
      background: var(--surface-2);
      cursor: pointer;
      font-family: var(--font-body);
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.82rem;
      transition: all 0.18s;
      text-align: center;
    }
    .preset-btn:hover  { border-color: var(--primary); }
    .preset-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }

    /* Color rows */
    .color-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-2, rgba(0,0,0,0.04));
    }
    .color-row:last-child { border-bottom: none; }
    .color-row input[type="color"] {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: var(--r-sm);
      cursor: pointer;
      padding: 2px;
      background: transparent;
      flex-shrink: 0;
    }
    .color-row-info { flex: 1; }
    .color-row-label { font-size: 0.875rem; color: var(--text-primary); display: block; font-weight: 500; }
    .color-row-hex   { font-size: 0.72rem; color: var(--text-muted); font-family: monospace; }
    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: var(--r-sm);
      flex-shrink: 0;
      box-shadow: var(--shadow-xs);
    }

    /* Font picker */
    .font-picker { position: relative; }
    .font-picker-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--r-md);
      cursor: pointer;
      font-size: 1rem;
      color: var(--text-primary);
      transition: border-color 0.18s;
      font-family: var(--font-body);
    }
    .font-picker-trigger:hover,
    .font-picker.open .font-picker-trigger {
      border-color: var(--primary);
    }
    .font-picker-list {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: var(--surface-3, var(--surface));
      border: 1.5px solid var(--border);
      border-radius: var(--r-md);
      box-shadow: var(--shadow-xl);
      z-index: 50;
      overflow-y: auto;
      max-height: 320px;
    }
    .font-picker-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 13px 16px;
      background: none;
      border: none;
      border-bottom: 1px solid var(--border-2, rgba(0,0,0,0.04));
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      gap: 12px;
    }
    .font-picker-item:last-child { border-bottom: none; }
    .font-picker-item:hover    { background: var(--surface-2); }
    .font-picker-item.selected { background: var(--primary-light); }
    .font-item-name {
      font-size: 1rem;
      color: var(--text-primary);
      flex: 1;
    }
    .font-item-tag {
      font-size: 0.68rem;
      color: var(--text-muted);
      background: var(--surface-2);
      padding: 2px 8px;
      border-radius: var(--r-full);
      white-space: nowrap;
      border: 1px solid var(--border);
    }

    /* Font preview */
    .font-preview-box {
      margin-top: 14px;
      padding: 16px;
      background: var(--surface-2);
      border-radius: var(--r-md);
      border: 1px solid var(--border);
    }
    .font-preview-heading {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .font-preview-body {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Range */
    .ap-range {
      width: 100%;
      margin: 8px 0 4px;
      accent-color: var(--primary);
    }
    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Size badge */
    .size-badge {
      display: inline-block;
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--r-full);
      margin-left: 8px;
      font-family: monospace;
    }

    /* Logo preview */
    .logo-preview-row {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Navbar preview */
    .navbar-preview { margin-top: 16px; }
    .navbar-preview-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .navbar-preview-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--r-md);
      overflow: hidden;
    }

    /* BG thumb */
    .bg-thumb {
      width: 80px;
      height: 50px;
      border-radius: var(--r-sm);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--border);
      flex-shrink: 0;
    }

    /* Checkbox */
    .ap-checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .ap-checkbox-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--primary);
    }
    .ap-checkbox-row label {
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    /* Footer */
    .ap-footer {
      display: flex;
      gap: 10px;
      position: sticky;
      bottom: 16px;
    }

    @media (max-width: 480px) {
      .preset-grid { grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
      .preset-btn  { font-size: 0.75rem; padding: 10px 4px; }
    }
  `]
})
export class AppearanceComponent implements OnInit {
  theme!: AppTheme;
  saved = false;
  fontPickerOpen = false;
  Math = Math;

  fonts = [
    { name: 'Syne',               tag: 'Display' },
    { name: 'DM Sans',            tag: 'Sans-serif' },
    { name: 'Outfit',             tag: 'Sans-serif' },
    { name: 'Space Grotesk',      tag: 'Sans-serif' },
    { name: 'Plus Jakarta Sans',  tag: 'Sans-serif' },
    { name: 'Raleway',            tag: 'Elegante' },
    { name: 'Josefin Sans',       tag: 'Geométrica' },
    { name: 'Playfair Display',   tag: 'Serif' },
    { name: 'Cormorant Garamond', tag: 'Serif fino' },
    { name: 'Crimson Pro',        tag: 'Serif editorial' },
    { name: 'Bebas Neue',         tag: 'Display bold' },
    { name: 'Cabin',              tag: 'Sans neutro' },
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.theme = this.themeService.getTheme();
    // defaults para props nuevas
    if (!this.theme.bodyTextColor)    this.theme.bodyTextColor    = '#111118';
    if (!this.theme.headingTextColor) this.theme.headingTextColor = '#111118';
    if (!this.theme.bodyFontSize)     this.theme.bodyFontSize     = 16;
  }

  getImageUrl(path: string): string {
    return this.themeService.getImageUrl(path);
  }

  applyPreset(mode: ThemeMode) {
    this.themeService.applyPreset(mode);
    this.theme = this.themeService.getTheme();
  }

  onColorChange() {
    this.themeService.applyTheme(this.theme);
  }

  selectFont(font: string) {
    this.theme.fontFamily = font;
    this.themeService.applyTheme(this.theme);
    this.fontPickerOpen = false;
  }

  async onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const url = await this.themeService.uploadLogo(file);
      this.theme.logoUrl = url;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (e) { console.error(e); }
  }

  async onBgUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const url = await this.themeService.uploadBackground(file);
      this.theme.backgroundUrl = url;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (e) { console.error(e); }
  }

  removeLogo() {
    this.themeService.removeLogo();
    this.theme.logoUrl = '';
  }

  removeBg() {
    this.themeService.removeBackground();
    this.theme.backgroundUrl = '';
  }

  async save() {
    try {
      await this.themeService.saveConfig();
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (e) { console.error(e); }
  }

  reset() {
    this.themeService.resetDefaults();
    this.theme = this.themeService.getTheme();
  }
}
