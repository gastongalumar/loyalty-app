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

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 48px; max-width: 720px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" style="font-size:0.875rem; color:var(--text-muted); text-decoration:none; display:inline-block; margin-bottom:8px;">
          ← {{ 'common.back' | translate }}
        </a>
        <h1 class="page-title">{{ 'appearance.title' | translate }}</h1>
        <p class="page-subtitle">{{ 'appearance.subtitle' | translate }}</p>
      </div>

      <div *ngIf="saved" class="alert alert-success fade-in">✅ {{ 'common.success' | translate }}</div>

      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.theme' | translate }}
        </h2>
        <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:10px;">
          <button class="theme-btn" [class.active]="theme.mode === 'light'" (click)="applyPreset('light')">
            ☀️ {{ 'appearance.themeLight' | translate }}
          </button>
          <button class="theme-btn" [class.active]="theme.mode === 'dark'" (click)="applyPreset('dark')">
            🌙 {{ 'appearance.themeDark' | translate }}
          </button>
          <button class="theme-btn" [class.active]="theme.mode === 'colorful'" (click)="applyPreset('colorful')">
            🎨 {{ 'appearance.themeColorful' | translate }}
          </button>
        </div>
      </div>

      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.colors' | translate }}
        </h2>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.primaryColor" (change)="onColorChange()">
          <label>{{ 'appearance.primaryColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.primaryColor }}</code>
        </div>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.secondaryColor" (change)="onColorChange()">
          <label>{{ 'appearance.secondaryColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.secondaryColor }}</code>
        </div>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.accentColor" (change)="onColorChange()">
          <label>{{ 'appearance.accentColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.accentColor }}</code>
        </div>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.navbarTextColor" (change)="onColorChange()">
          <label>Navbar text color</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.navbarTextColor }}</code>
        </div>
      </div>

      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.branding' | translate }}
        </h2>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.appName' | translate }}</label>
          <input type="text" class="form-control" [(ngModel)]="theme.appName"
                 (change)="onColorChange()" placeholder="Mi App">
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.logoSize' | translate }} ({{ theme.logoSize }}px)</label>
          <input type="range" min="24" max="48" step="1"
                 [(ngModel)]="theme.logoSize" (change)="onColorChange()">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
            <span>24px</span><span>36px</span><span>48px</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.nameSize' | translate }} ({{ theme.nameSize }}px)</label>
          <input type="range" min="14" max="24" step="1"
                 [(ngModel)]="theme.nameSize" (change)="onColorChange()">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
            <span>14px</span><span>18px</span><span>24px</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.uploadLogo' | translate }}</label>
          <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                 class="form-control" (change)="onLogoUpload($event)">
          <div *ngIf="theme.logoUrl" style="margin-top:10px; display:flex; align-items:center; gap:10px;">
            <img [src]="getImageUrl(theme.logoUrl)" style="height:48px; object-fit:contain; border-radius:8px; border:1px solid var(--border); padding:4px;">
            <button class="btn btn-outline btn-sm" (click)="removeLogo()">🗑️ Remove</button>
          </div>
        </div>

        <div style="background: var(--secondary); border-radius: var(--radius-md); padding: 12px; margin-top: 16px;">
          <div style="font-size:0.75rem; color:rgba(255,255,255,0.5); margin-bottom:8px; text-transform:uppercase;">
            Vista previa en navbar
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <img *ngIf="theme.logoUrl" [src]="getImageUrl(theme.logoUrl)"
                 [style.width.px]="theme.logoSize" [style.height.px]="theme.logoSize"
                 style="object-fit:contain;">
            <span [style.fontSize.px]="theme.nameSize"
                  [style.fontFamily]="'var(--font-display)'"
                  [style.fontWeight]="'800'"
                  [style.color]="theme.navbarTextColor">
              {{ theme.appName || 'LoyaltyCard' }}
            </span>
          </div>
        </div>
      </div>

      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.fonts' | translate }}
        </h2>
        <div class="font-grid">
          <button *ngFor="let font of fonts"
                  class="font-btn"
                  [class.active]="theme.fontFamily === font"
                  [style.font-family]="font"
                  (click)="selectFont(font)">
            {{ font }}
          </button>
        </div>
      </div>

      <div class="card fade-in" style="margin-bottom: 24px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.uploadBackground' | translate }}
        </h2>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.uploadBackground' | translate }}</label>
          <input type="file" accept="image/*" class="form-control" (change)="onBgUpload($event)">
          <div *ngIf="theme.backgroundUrl" style="margin-top:10px;">
            <button class="btn btn-outline btn-sm" (click)="removeBg()">🗑️ Remove background</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.backgroundSize' | translate }}</label>
          <select class="form-control" [(ngModel)]="theme.backgroundSize" (change)="onColorChange()">
            <option value="cover">{{ 'appearance.bgCover' | translate }}</option>
            <option value="contain">{{ 'appearance.bgContain' | translate }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Card transparency ({{ theme.cardOpacity }}%)</label>
          <input type="range" min="0" max="100" step="5"
                 [(ngModel)]="theme.cardOpacity" (change)="onColorChange()">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
            <span>Sólido</span><span>50%</span><span>Transparente</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <input type="checkbox" id="bgBlur" [(ngModel)]="theme.backgroundBlur" (change)="onColorChange()"
                 style="width:18px; height:18px; cursor:pointer;">
          <label for="bgBlur" style="cursor:pointer; font-size:0.9rem; color:var(--text-secondary);">
            {{ 'appearance.bgBlur' | translate }}
          </label>
        </div>

        <div *ngIf="theme.backgroundUrl" style="margin-top:16px; padding:12px; background:var(--surface); border-radius:var(--radius-md);">
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Background preview:</div>
          <div style="height:100px; border-radius:var(--radius-sm); background-size:cover; background-position:center;"
               [style.backgroundImage]="'url(' + getImageUrl(theme.backgroundUrl) + ')'">
          </div>
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" style="flex:1" (click)="save()">
          {{ 'appearance.saveAppearance' | translate }}
        </button>
        <button class="btn btn-outline" (click)="reset()">
          {{ 'appearance.resetDefaults' | translate }}
        </button>
      </div>
    </div>
  `
})
export class AppearanceComponent implements OnInit {
  theme!: AppTheme;
  saved = false;
  fonts = ['Syne', 'DM Sans', 'Outfit', 'Space Grotesk', 'Plus Jakarta Sans'];

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.theme = this.themeService.getTheme();
  }

  // Helper para URLs de imágenes
  getImageUrl(path: string): string {
    return this.themeService.getImageUrl(path);
  }

  applyPreset(mode: ThemeMode) {
    this.themeService.applyPreset(mode);
    this.theme = this.themeService.getTheme();
  }

  // SOLO VISTA PREVIA, NO GUARDA
  onColorChange() {
    this.themeService.applyTheme(this.theme);
  }

  selectFont(font: string) {
    this.theme.fontFamily = font;
    this.themeService.applyTheme(this.theme);
  }

  async onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const url = await this.themeService.uploadLogo(file);
      this.theme.logoUrl = url;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (error) {
      console.error('Error uploading logo', error);
    }
  }

  async onBgUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const url = await this.themeService.uploadBackground(file);
      this.theme.backgroundUrl = url;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (error) {
      console.error('Error uploading background', error);
    }
  }

  removeLogo() {
    this.themeService.removeLogo();
    this.theme.logoUrl = '';
  }

  removeBg() {
    this.themeService.removeBackground();
    this.theme.backgroundUrl = '';
  }

  // GUARDA SOLO CONFIGURACIÓN (SIN IMÁGENES)
  async save() {
    try {
      await this.themeService.saveConfig();
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    } catch (error) {
      console.error('Error saving config', error);
    }
  }

  reset() {
    this.themeService.resetDefaults();
    this.theme = this.themeService.getTheme();
  }
}
