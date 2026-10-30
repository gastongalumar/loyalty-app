import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { EmojiPickerComponent } from '../../components/emoji-picker/emoji-picker.component';
import { PlatformService } from '../../services/platform.service';
import { Admin, Business } from '../../models/models';
import { businessStatusKey, businessStatusTone } from '../../utils/status';
import { apiErrorMessage } from '../../utils/api-error';
import { DEFAULT_REWARD_ICON, DEFAULT_STAMP_ICON } from '../../utils/emoji-catalog';
import { mediaUrl } from '../../utils/media-url';

@Component({
  selector: 'app-platform-business-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NavbarComponent,
    EmojiPickerComponent
  ],
  templateUrl: './platform-business-detail.component.html',
  styleUrls: ['./platform-business-detail.component.css']
})
export class PlatformBusinessDetailComponent implements OnInit {
  business: Business | null = null;
  admins: Admin[] = [];
  adminForm = { email: '', password: '', firstName: '', lastName: '' };
  editForm: Partial<Business> = this.emptyForm();
  backgroundPreview = '';
  creatingAdmin = false;
  saving = false;
  uploadingBackground = false;
  removingBackground = false;
  loading = true;
  error = '';
  success = '';
  private id = 0;

  constructor(
    private route: ActivatedRoute,
    private platform: PlatformService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  get statusKey(): string {
    return businessStatusKey(this.business?.status ?? 'ACTIVE');
  }

  get statusTone(): string {
    return businessStatusTone(this.business?.status ?? 'ACTIVE');
  }

  get stampIcon(): string {
    return this.editForm.stampIcon || DEFAULT_STAMP_ICON;
  }

  get rewardIcon(): string {
    return this.editForm.rewardIcon || DEFAULT_REWARD_ICON;
  }

  get canCreateAdmin(): boolean {
    return !this.creatingAdmin
      && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.adminForm.email.trim())
      && this.adminForm.password.length >= 6
      && this.adminForm.firstName.trim().length >= 1
      && this.adminForm.lastName.trim().length >= 1;
  }

  get canSave(): boolean {
    const stamps = Number(this.editForm.stampsRequired);
    return !this.saving
      && Boolean(this.editForm.name?.trim())
      && Number.isFinite(stamps)
      && stamps >= 1
      && stamps <= 100;
  }

  initials(admin: Admin): string {
    const first = admin.firstName?.trim().charAt(0) ?? '';
    const last = admin.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  load(): void {
    this.loading = true;
    this.platform.get(this.id).subscribe({
      next: (business) => {
        this.business = business;
        this.fillForm(business);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || this.translate.instant('ERRORS.LOAD_BUSINESS');
        this.loading = false;
      }
    });
    this.platform.listAdmins(this.id).subscribe({
      next: (admins) => this.admins = admins,
      error: () => this.admins = []
    });
  }

  onBackgroundChange(): void {
    this.backgroundPreview = mediaUrl(this.editForm.backgroundUrl);
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
    this.error = '';
    this.success = '';

    this.platform.uploadBackgroundFor(this.id, file).subscribe({
      next: (business) => {
        this.uploadingBackground = false;
        this.business = business;
        this.fillForm(business);
        this.success = this.translate.instant('COMMON.SAVED');
        setTimeout(() => this.success = '', 2500);
      },
      error: (err) => {
        this.uploadingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.UPLOAD_BACKGROUND'));
      }
    });
  }

  removeBackground(): void {
    if (!this.editForm.backgroundUrl) {
      return;
    }
    this.removingBackground = true;
    this.error = '';
    this.success = '';

    this.platform.removeBackgroundFor(this.id).subscribe({
      next: (business) => {
        this.removingBackground = false;
        this.business = business;
        this.fillForm(business);
        this.success = this.translate.instant('COMMON.SAVED');
        setTimeout(() => this.success = '', 2500);
      },
      error: (err) => {
        this.removingBackground = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.REMOVE_BACKGROUND'));
      }
    });
  }

  saveBusiness(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    const payload: Partial<Business> = {
      name: this.editForm.name,
      description: this.editForm.description,
      logoUrl: this.editForm.logoUrl,
      backgroundUrl: this.editForm.backgroundUrl || '',
      backgroundVisibility: this.editForm.backgroundVisibility ?? 20,
      backgroundBlur: this.editForm.backgroundBlur ?? 8,
      stampsRequired: this.editForm.stampsRequired,
      rewardDescription: this.editForm.rewardDescription,
      colorPrimary: (this.editForm.colorPrimary || '').toUpperCase(),
      colorSecondary: (this.editForm.colorSecondary || '').toUpperCase(),
      stampIcon: this.editForm.stampIcon || DEFAULT_STAMP_ICON,
      rewardIcon: this.editForm.rewardIcon || DEFAULT_REWARD_ICON
    };

    this.platform.update(this.id, payload).subscribe({
      next: (business) => {
        this.saving = false;
        this.business = business;
        this.fillForm(business);
        this.success = this.translate.instant('SUCCESS.BUSINESS_UPDATED', { name: business.name });
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.error = apiErrorMessage(err, this.translate,
          this.translate.instant('ERRORS.SAVE_BUSINESS'));
      }
    });
  }

  createAdmin(): void {
    if (!this.canCreateAdmin) {
      return;
    }
    this.creatingAdmin = true;
    this.error = '';
    this.success = '';
    this.platform.createAdmin(this.id, this.adminForm).subscribe({
      next: (admin) => {
        this.creatingAdmin = false;
        this.success = this.translate.instant('SUCCESS.ADMIN_CREATED', { email: admin.email });
        this.adminForm = { email: '', password: '', firstName: '', lastName: '' };
        this.load();
      },
      error: (err) => {
        this.creatingAdmin = false;
        this.error = apiErrorMessage(err, this.translate, this.translate.instant('ERRORS.CREATE_ADMIN'));
      }
    });
  }

  private fillForm(business: Business): void {
    this.editForm = {
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
    this.onBackgroundChange();
  }

  private emptyForm(): Partial<Business> {
    return {
      name: '',
      description: '',
      logoUrl: '',
      backgroundUrl: '',
      backgroundVisibility: 20,
      backgroundBlur: 8,
      stampsRequired: 10,
      rewardDescription: '',
      colorPrimary: '',
      colorSecondary: '',
      stampIcon: DEFAULT_STAMP_ICON,
      rewardIcon: DEFAULT_REWARD_ICON
    };
  }

  private token(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
}
