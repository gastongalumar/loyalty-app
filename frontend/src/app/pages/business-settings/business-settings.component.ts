import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { Business } from '../../models/models';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'BUSINESS.SETTINGS_TITLE' | translate }}</h1>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="saved" class="alert alert-success">{{ 'COMMON.SAVED' | translate }}</div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">{{ 'COMMON.NAME' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.name" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.DESCRIPTION' | translate }}</label>
          <textarea class="form-control" rows="3" [(ngModel)]="form.description"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.STAMPS_REQUIRED' | translate }}</label>
          <input type="number" class="form-control" [(ngModel)]="form.stampsRequired" min="1" max="100" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.REWARD' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.rewardDescription" />
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <h3 style="margin-bottom:12px;">{{ 'BUSINESS.APPEARANCE' | translate }}</h3>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ 'BUSINESS.PRIMARY_COLOR' | translate }}</label>
            <input type="color" class="form-control" [(ngModel)]="form.colorPrimary"
                   (ngModelChange)="onColorChange()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'BUSINESS.SECONDARY_COLOR' | translate }}</label>
            <input type="color" class="form-control" [(ngModel)]="form.colorSecondary"
                   (ngModelChange)="onColorChange()" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'BUSINESS.LOGO_URL' | translate }}</label>
          <input class="form-control" [(ngModel)]="form.logoUrl" (ngModelChange)="onLogoChange()" />
        </div>

        <div *ngIf="logoPreview" style="margin-top:8px;">
          <div class="form-label">{{ 'BUSINESS.LOGO_PREVIEW' | translate }}</div>
          <img [src]="logoPreview" alt="logo" style="max-height:60px;max-width:200px;border-radius:6px;" />
        </div>

        <div style="display:flex; gap:12px; margin-top:12px; align-items:center;">
          <span class="badge badge-primary">Aa</span>
          <span style="color: var(--color-accent); font-weight:700;">{{ 'BUSINESS.PRIMARY_COLOR' | translate }}</span>
          <span style="color: var(--color-text); font-weight:700;">{{ 'BUSINESS.SECONDARY_COLOR' | translate }}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-lg" style="margin-top:16px;"
              [disabled]="saving" (click)="save()">
        {{ saving ? ('COMMON.LOADING' | translate) : ('COMMON.SAVE' | translate) }}
      </button>
    </div>
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    input[type="color"].form-control { height: 44px; padding: 4px; }
  `]
})
export class BusinessSettingsComponent implements OnInit {
  form: Partial<Business> = {
    name: '', description: '', logoUrl: '', stampsRequired: 10, rewardDescription: '',
    colorPrimary: '', colorSecondary: ''
  };
  saving = false;
  saved = false;
  error = '';
  logoPreview = '';
  private slug = '';
  private status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' = 'ACTIVE';
  private stamp = Date.now();

  constructor(private platform: PlatformService, private theme: ThemeService) {}

  ngOnInit(): void {
    this.platform.getMyBusiness().subscribe({
      next: (business) => {
        this.slug = business.slug;
        this.status = business.status;
        this.form = {
          name: business.name,
          description: business.description,
          logoUrl: business.logoUrl,
          stampsRequired: business.stampsRequired,
          rewardDescription: business.rewardDescription,
          colorPrimary: business.colorPrimary || this.token('--color-accent'),
          colorSecondary: business.colorSecondary || this.token('--color-text')
        };
        this.onLogoChange();
      },
      error: (err) => this.error = err.error?.message || 'Could not load business'
    });
  }

  onColorChange(): void {
    this.applyPreview();
  }

  onLogoChange(): void {
    const url = (this.form.logoUrl || '').trim();
    if (!url) {
      this.logoPreview = '';
      return;
    }
    const separator = url.includes('?') ? '&' : '?';
    this.logoPreview = `${url}${separator}v=${this.stamp}`;
  }

  save(): void {
    this.saving = true;
    this.error = '';
    this.saved = false;
    this.stamp = Date.now();

    const payload: Partial<Business> = {
      name: this.form.name,
      description: this.form.description,
      logoUrl: this.form.logoUrl,
      stampsRequired: this.form.stampsRequired,
      rewardDescription: this.form.rewardDescription,
      colorPrimary: (this.form.colorPrimary || '').toUpperCase(),
      colorSecondary: (this.form.colorSecondary || '').toUpperCase()
    };

    this.platform.updateMyBusiness(payload).subscribe({
      next: (business) => {
        this.saving = false;
        this.saved = true;
        this.onLogoChange();
        this.applyPreview(business);
        setTimeout(() => this.saved = false, 2500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not save';
        this.saving = false;
      }
    });
  }

  private token(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private applyPreview(business?: Business): void {
    this.theme.apply({
      slug: business?.slug || this.slug,
      name: business?.name || this.form.name || '',
      status: business?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      colorPrimary: business?.colorPrimary || this.form.colorPrimary,
      colorSecondary: business?.colorSecondary || this.form.colorSecondary,
      logoUrl: business?.logoUrl || this.form.logoUrl
    });
  }
}
