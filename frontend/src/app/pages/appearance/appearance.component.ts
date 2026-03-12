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

      <!-- THEME MODE -->
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

      <!-- COLORS -->
      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.colors' | translate }}
        </h2>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.primaryColor" (change)="onColorChange()" />
          <label>{{ 'appearance.primaryColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.primaryColor }}</code>
        </div>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.secondaryColor" (change)="onColorChange()" />
          <label>{{ 'appearance.secondaryColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.secondaryColor }}</code>
        </div>

        <div class="color-picker-row">
          <input type="color" [(ngModel)]="theme.accentColor" (change)="onColorChange()" />
          <label>{{ 'appearance.accentColor' | translate }}</label>
          <code style="font-size:0.8rem; color:var(--text-muted);">{{ theme.accentColor }}</code>
        </div>
      </div>

      <!-- FONTS -->
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

      <!-- BRANDING: LOGO -->
      <div class="card fade-in" style="margin-bottom: 16px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.branding' | translate }}
        </h2>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.uploadLogo' | translate }}</label>
          <input type="file" accept="image/png,image/jpeg,image/svg+xml"
                 class="form-control" (change)="onLogoUpload($event)" />
          <div *ngIf="theme.logoUrl" style="margin-top:10px;">
            <img [src]="theme.logoUrl" style="height:48px; object-fit:contain; border-radius:8px; border:1px solid var(--border); padding:4px;" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.logoPosition' | translate }}</label>
          <select class="form-control" [(ngModel)]="theme.logoPosition" (change)="onColorChange()">
            <option value="top-left">{{ 'appearance.positionTopLeft' | translate }}</option>
            <option value="centered">{{ 'appearance.positionCenter' | translate }}</option>
            <option value="header">{{ 'appearance.positionHeader' | translate }}</option>
          </select>
        </div>
      </div>

      <!-- BRANDING: BACKGROUND -->
      <div class="card fade-in" style="margin-bottom: 24px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          {{ 'appearance.uploadBackground' | translate }}
        </h2>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.uploadBackground' | translate }}</label>
          <input type="file" accept="image/*" class="form-control" (change)="onBgUpload($event)" />
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'appearance.backgroundSize' | translate }}</label>
          <select class="form-control" [(ngModel)]="theme.backgroundSize" (change)="onColorChange()">
            <option value="cover">{{ 'appearance.bgCover' | translate }}</option>
            <option value="contain">{{ 'appearance.bgContain' | translate }}</option>
          </select>
        </div>

        <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <input type="checkbox" id="bgBlur" [(ngModel)]="theme.backgroundBlur" (change)="onColorChange()"
                 style="width:18px; height:18px; cursor:pointer;" />
          <label for="bgBlur" style="cursor:pointer; font-size:0.9rem; color:var(--text-secondary);">
            {{ 'appearance.bgBlur' | translate }}
          </label>
        </div>
      </div>

      <!-- ACTIONS -->
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
  }

  onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.theme.logoUrl = reader.result as string;
      this.themeService.applyTheme(this.theme);
    };
    reader.readAsDataURL(file);
  }

  onBgUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.theme.backgroundUrl = reader.result as string;
      this.themeService.applyTheme(this.theme);
    };
    reader.readAsDataURL(file);
  }

  save() {
    this.themeService.applyTheme(this.theme);
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }

  reset() {
    this.themeService.resetDefaults();
    this.theme = this.themeService.getTheme();
  }
}
