import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { EmojiPickerComponent } from '../../components/emoji-picker/emoji-picker.component';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { SlugService } from '../../services/slug.service';
import { Business } from '../../models/models';
import { DEFAULT_REWARD_ICON, DEFAULT_STAMP_ICON } from '../../utils/emoji-catalog';
import { apiErrorMessage } from '../../utils/api-error';
import { mediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NavbarComponent,
    EmojiPickerComponent
  ],
  templateUrl: './business-settings.component.html',
  styleUrls: ['./business-settings.component.css']
})
export class BusinessSettingsComponent implements OnInit {
  form: Partial<Business> = {
    name: '', description: '', logoUrl: '', backgroundUrl: '',
    backgroundVisibility: 20, backgroundBlur: 8,
    stampsRequired: 10, rewardDescription: '',
    colorPrimary: '', colorSecondary: '',
    stampIcon: DEFAULT_STAMP_ICON, rewardIcon: DEFAULT_REWARD_ICON
  };
  saving = false;
  saved = false;
  error = '';
  logoPreview = '';
  logoError = false;
  backgroundPreview = '';
  uploadingBackground = false;
  removingBackground = false;
  backgroundMessage = '';
  private slug = '';
  private status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' = 'ACTIVE';
  private stamp = Date.now();

  constructor(
    private platform: PlatformService,
    private theme: ThemeService,
    private slugService: SlugService,
    private translate: TranslateService
  ) {}

  get canSave(): boolean {
    const stamps = Number(this.form.stampsRequired);
    return Boolean(this.form.name?.trim())
      && Number.isFinite(stamps)
      && stamps >= 1
      && stamps <= 100
      && !this.saving;
  }

  get stampIcon(): string {
    return this.form.stampIcon || DEFAULT_STAMP_ICON;
  }

  get rewardIcon(): string {
    return this.form.rewardIcon || DEFAULT_REWARD_ICON;
  }

  /** Sellos visibles en la vista previa (máximo 12 para no romper la tarjeta). */
  get previewStamps(): number[] {
    const total = Math.min(Math.max(Number(this.form.stampsRequired) || 0, 1), 12);
    return Array.from({ length: total }, (_, i) => i);
  }

  get previewFilled(): number {
    return Math.min(3, this.previewStamps.length);
  }

  get previewOverflow(): number {
    return Math.max((Number(this.form.stampsRequired) || 0) - this.previewStamps.length, 0);
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
          backgroundUrl: business.backgroundUrl || '',
          backgroundVisibility: business.backgroundVisibility ?? 20,
          backgroundBlur: business.backgroundBlur ?? 8,
          stampsRequired: business.stampsRequired,
          rewardDescription: business.rewardDescription,
          colorPrimary: business.colorPrimary || this.token('--color-accent'),
          colorSecondary: business.colorSecondary || this.token('--color-text'),
          stampIcon: business.stampIcon || DEFAULT_STAMP_ICON,
          rewardIcon: business.rewardIcon || DEFAULT_REWARD_ICON
        };
        this.onLogoChange();
        this.onBackgroundChange();
        this.applyPreview(business);
      },
      error: (err) => this.error = err.error?.message || this.translate.instant('ERRORS.LOAD_BUSINESS')
    });
  }

  onColorChange(): void {
    this.applyPreview();
  }

  applyPreset(tokenName: string): void {
    const value = this.token(tokenName);
    if (!value) {
      return;
    }
    this.form.colorPrimary = value.toUpperCase();
    this.onColorChange();
  }

  onLogoChange(): void {
    const url = (this.form.logoUrl || '').trim();
    this.logoError = false;
    if (!url) {
      this.logoPreview = '';
      return;
    }
    const separator = url.includes('?') ? '&' : '?';
    this.logoPreview = `${url}${separator}v=${this.stamp}`;
  }

  onLogoError(): void {
    this.logoError = true;
  }

  onBackgroundChange(): void {
    const url = (this.form.backgroundUrl || '').trim();
    this.backgroundPreview = mediaUrl(url);
    this.applyPreview();
  }

  onBackgroundStyleChange(): void {
    this.applyPreview();
  }

  onBackgroundFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.error = this.translate.instant('BUSINESS.BACKGROUND_TYPE_ERROR');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = this.translate.instant('BUSINESS.BACKGROUND_SIZE_ERROR');
      return;
    }

    this.uploadingBackground = true;
    this.backgroundMessage = '';
    this.error = '';

    this.platform.uploadBackground(file).subscribe({
      next: (business) => {
        this.uploadingBackground = false;
        this.form.backgroundUrl = business.backgroundUrl || '';
        this.onBackgroundChange();
        this.applyPreview(business);
        this.flashBackgroundMessage();
      },
      error: (err) => {
        this.uploadingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.UPLOAD_BACKGROUND'));
      }
    });
  }

  removeBackground(): void {
    if (!this.form.backgroundUrl) {
      return;
    }

    this.removingBackground = true;
    this.backgroundMessage = '';
    this.error = '';

    this.platform.removeBackground().subscribe({
      next: (business) => {
        this.removingBackground = false;
        this.form.backgroundUrl = '';
        this.onBackgroundChange();
        this.applyPreview(business);
        this.flashBackgroundMessage();
      },
      error: (err) => {
        this.removingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.REMOVE_BACKGROUND'));
      }
    });
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
      backgroundUrl: this.form.backgroundUrl || '',
      backgroundVisibility: this.form.backgroundVisibility ?? 20,
      backgroundBlur: this.form.backgroundBlur ?? 8,
      stampsRequired: this.form.stampsRequired,
      rewardDescription: this.form.rewardDescription,
      colorPrimary: (this.form.colorPrimary || '').toUpperCase(),
      colorSecondary: (this.form.colorSecondary || '').toUpperCase(),
      stampIcon: this.form.stampIcon || DEFAULT_STAMP_ICON,
      rewardIcon: this.form.rewardIcon || DEFAULT_REWARD_ICON
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
        this.error = err.error?.message || this.translate.instant('ERRORS.SAVE_BUSINESS');
        this.saving = false;
      }
    });
  }

  private flashBackgroundMessage(): void {
    this.backgroundMessage = this.translate.instant('COMMON.SAVED');
    setTimeout(() => this.backgroundMessage = '', 2500);
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
      logoUrl: business?.logoUrl || this.form.logoUrl,
      backgroundUrl: business?.backgroundUrl || this.form.backgroundUrl,
      backgroundVisibility: business?.backgroundVisibility ?? this.form.backgroundVisibility,
      backgroundBlur: business?.backgroundBlur ?? this.form.backgroundBlur,
      stampIcon: business?.stampIcon || this.form.stampIcon,
      rewardIcon: business?.rewardIcon || this.form.rewardIcon
    });

    if (business) {
      this.slugService.updateTenant({
        name: business.name,
        colorPrimary: business.colorPrimary,
        colorSecondary: business.colorSecondary,
        logoUrl: business.logoUrl,
        backgroundUrl: business.backgroundUrl,
        backgroundVisibility: business.backgroundVisibility,
        backgroundBlur: business.backgroundBlur,
        stampIcon: business.stampIcon,
        rewardIcon: business.rewardIcon
      });
    }
  }
}
