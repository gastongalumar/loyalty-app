import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { EmojiPickerComponent } from '../../components/emoji-picker/emoji-picker.component';
import { PlatformService } from '../../services/platform.service';
import { Business, BusinessSummary } from '../../models/models';
import { businessStatusKey, businessStatusTone } from '../../utils/status';
import { apiErrorMessage } from '../../utils/api-error';
import { DEFAULT_REWARD_ICON, DEFAULT_STAMP_ICON } from '../../utils/emoji-catalog';

@Component({
  selector: 'app-platform-businesses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NavbarComponent,
    EmojiPickerComponent
  ],
  templateUrl: './platform-businesses.component.html',
  styleUrls: ['./platform-businesses.component.css']
})
export class PlatformBusinessesComponent implements OnInit {
  businesses: BusinessSummary[] = [];
  createForm = {
    name: '',
    slug: '',
    rewardDescription: '',
    stampIcon: DEFAULT_STAMP_ICON,
    rewardIcon: DEFAULT_REWARD_ICON
  };
  creating = false;
  error = '';
  success = '';
  private slugTouched = false;

  constructor(
    private platform: PlatformService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onNameChange(): void {
    if (!this.slugTouched) {
      this.createForm.slug = this.slugify(this.createForm.name);
    }
  }

  onSlugChange(value: string): void {
    this.slugTouched = true;
    this.createForm.slug = this.slugify(value);
  }

  canCreate(): boolean {
    const slug = this.createForm.slug;
    return !this.creating
      && this.createForm.name.trim().length >= 2
      && slug.length >= 3
      && slug.length <= 80
      && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  }

  statusKey(business: BusinessSummary): string {
    return businessStatusKey(business.status);
  }

  statusTone(business: BusinessSummary): string {
    return businessStatusTone(business.status);
  }

  initial(business: BusinessSummary): string {
    return business.name?.trim().charAt(0).toUpperCase() || '?';
  }

  load(): void {
    this.platform.list().subscribe({
      next: (page) => this.businesses = page.content,
      error: (err) => this.error = err.error?.message || this.translate.instant('ERRORS.LOAD_BUSINESSES')
    });
  }

  create(): void {
    if (!this.canCreate()) {
      this.error = this.translate.instant('ERRORS.INVALID_BUSINESS');
      return;
    }
    this.creating = true;
    this.error = '';
    this.success = '';

    const payload: Partial<Business> = {
      name: this.createForm.name.trim(),
      slug: this.createForm.slug,
      rewardDescription: this.createForm.rewardDescription || undefined,
      stampIcon: this.createForm.stampIcon,
      rewardIcon: this.createForm.rewardIcon,
      stampsRequired: 10
    };

    this.platform.create(payload).subscribe({
      next: (business) => {
        this.creating = false;
        this.success = this.translate.instant('SUCCESS.BUSINESS_CREATED', { name: business.name });
        this.createForm = {
          name: '',
          slug: '',
          rewardDescription: '',
          stampIcon: DEFAULT_STAMP_ICON,
          rewardIcon: DEFAULT_REWARD_ICON
        };
        this.slugTouched = false;
        this.load();
      },
      error: (err) => {
        this.creating = false;
        this.error = this.formatError(err, this.translate.instant('ERRORS.CREATE_BUSINESS'));
      }
    });
  }

  setStatus(business: BusinessSummary, status: 'ACTIVE' | 'SUSPENDED'): void {
    this.error = '';
    this.platform.updateStatus(business.id, status).subscribe({
      next: (updated) => business.status = updated.status,
      error: (err) => this.error = this.formatError(err, this.translate.instant('ERRORS.UPDATE_STATUS'))
    });
  }

  private slugify(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .slice(0, 80);
  }

  private formatError(err: unknown, fallback: string): string {
    return apiErrorMessage(err, this.translate, fallback);
  }
}
