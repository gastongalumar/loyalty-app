import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { PlatformBrandingService } from '../../services/platform-branding.service';
import { PlatformSettings } from '../../models/models';
import { apiErrorMessage } from '../../utils/api-error';
import { mediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  templateUrl: './platform-settings.component.html',
  styleUrls: ['./platform-settings.component.css']
})
export class PlatformSettingsComponent implements OnInit {
  form: Partial<PlatformSettings> = {
    appName: '',
    tagline: '',
    logoUrl: '',
    backgroundUrl: '',
    backgroundVisibility: 20,
    backgroundBlur: 8,
    colorPrimary: '',
    colorSecondary: ''
  };
  logoPreview = '';
  backgroundPreview = '';
  loading = true;
  saving = false;
  uploadingLogo = false;
  removingLogo = false;
  uploadingBackground = false;
  removingBackground = false;
  error = '';
  success = '';

  constructor(
    private platform: PlatformService,
    private branding: PlatformBrandingService,
    private translate: TranslateService
  ) {}

  get canSave(): boolean {
    return !this.saving && (this.form.appName || '').trim().length >= 2;
  }

  ngOnInit(): void {
    this.platform.getSettings().subscribe({
      next: (settings) => {
        this.branding.set(settings);
        this.fillForm(settings);
        this.loading = false;
      },
      error: (err) => {
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.LOAD_PLATFORM_SETTINGS'));
        this.loading = false;
      }
    });
  }

  onLogoChange(): void {
    this.logoPreview = mediaUrl(this.form.logoUrl);
  }

  onBackgroundChange(): void {
    this.backgroundPreview = mediaUrl(this.form.backgroundUrl);
  }

  onLogoFile(event: Event): void {
    const file = this.readFile(event);
    if (!file) {
      return;
    }
    this.uploadingLogo = true;
    this.error = '';
    this.success = '';
    this.platform.uploadSettingsLogo(file).subscribe({
      next: (settings) => this.afterAssetUpdate(settings),
      error: (err) => {
        this.uploadingLogo = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.UPLOAD_LOGO'));
      }
    });
  }

  removeLogo(): void {
    this.removingLogo = true;
    this.error = '';
    this.success = '';
    this.platform.removeSettingsLogo().subscribe({
      next: (settings) => {
        this.removingLogo = false;
        this.afterAssetUpdate(settings);
      },
      error: (err) => {
        this.removingLogo = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.REMOVE_LOGO'));
      }
    });
  }

  onBackgroundFile(event: Event): void {
    const file = this.readFile(event);
    if (!file) {
      return;
    }
    this.uploadingBackground = true;
    this.error = '';
    this.success = '';
    this.platform.uploadSettingsBackground(file).subscribe({
      next: (settings) => this.afterAssetUpdate(settings),
      error: (err) => {
        this.uploadingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.UPLOAD_BACKGROUND'));
      }
    });
  }

  removeBackground(): void {
    this.removingBackground = true;
    this.error = '';
    this.success = '';
    this.platform.removeSettingsBackground().subscribe({
      next: (settings) => {
        this.removingBackground = false;
        this.afterAssetUpdate(settings);
      },
      error: (err) => {
        this.removingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.REMOVE_BACKGROUND'));
      }
    });
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    const payload: Partial<PlatformSettings> = {
      appName: (this.form.appName || '').trim(),
      tagline: this.form.tagline || '',
      logoUrl: this.form.logoUrl || '',
      backgroundUrl: this.form.backgroundUrl || '',
      backgroundVisibility: this.form.backgroundVisibility ?? 20,
      backgroundBlur: this.form.backgroundBlur ?? 8,
      colorPrimary: (this.form.colorPrimary || '').toUpperCase(),
      colorSecondary: (this.form.colorSecondary || '').toUpperCase()
    };

    this.platform.updateSettings(payload).subscribe({
      next: (settings) => {
        this.saving = false;
        this.branding.set(settings);
        this.fillForm(settings);
        this.success = this.translate.instant('SUCCESS.PLATFORM_UPDATED');
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.SAVE_PLATFORM_SETTINGS'));
      }
    });
  }

  private afterAssetUpdate(settings: PlatformSettings): void {
    this.uploadingLogo = false;
    this.uploadingBackground = false;
    this.removingLogo = false;
    this.removingBackground = false;
    this.branding.set(settings);
    this.fillForm(settings);
    this.success = this.translate.instant('COMMON.SAVED');
    setTimeout(() => this.success = '', 2500);
  }

  private fillForm(settings: PlatformSettings): void {
    this.form = {
      appName: settings.appName,
      tagline: settings.tagline || '',
      logoUrl: settings.logoUrl || '',
      backgroundUrl: settings.backgroundUrl || '',
      backgroundVisibility: settings.backgroundVisibility ?? 20,
      backgroundBlur: settings.backgroundBlur ?? 8,
      colorPrimary: settings.colorPrimary || this.token('--color-accent'),
      colorSecondary: settings.colorSecondary || this.token('--color-text')
    };
    this.onLogoChange();
    this.onBackgroundChange();
  }

  private readFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return null;
    }
    if (!file.type.startsWith('image/')) {
      this.error = this.translate.instant('BUSINESS.BACKGROUND_TYPE_ERROR');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = this.translate.instant('BUSINESS.BACKGROUND_SIZE_ERROR');
      return null;
    }
    return file;
  }

  private token(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
}
