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
  templateUrl: './business-settings.component.html',
  styleUrls: ['./business-settings.component.css']
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

  get canSave(): boolean {
    const stamps = Number(this.form.stampsRequired);
    return Boolean(this.form.name?.trim())
      && Number.isFinite(stamps)
      && stamps >= 1
      && stamps <= 100
      && !this.saving;
  }

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
