import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SlugService } from '../../services/slug.service';
import { ThemeService } from '../../services/theme.service';
import { PlatformBrandingService } from '../../services/platform-branding.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  slug = '';
  loading = false;
  error = '';

  constructor(
    private slugService: SlugService,
    private router: Router,
    private translate: TranslateService,
    private theme: ThemeService,
    private platformBranding: PlatformBrandingService
  ) {}

  ngOnInit(): void {
    this.theme.reset();
    this.platformBranding.loadAndApply();
  }

  get platformName(): string {
    return this.platformBranding.appName || this.translate.instant('APP.NAME');
  }

  get platformLogo(): string | null {
    return this.platformBranding.logoUrl;
  }

  go(): void {
    const value = this.slug.trim().toLowerCase();
    if (!value) {
      return;
    }
    if (this.slugService.isReserved(value)) {
      this.error = this.translate.instant('ERRORS.SLUG_RESERVED');
      return;
    }

    this.loading = true;
    this.error = '';
    this.slugService.validate(value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/', value, 'login']);
      },
      error: () => {
        this.loading = false;
        this.error = this.translate.instant('ERRORS.BUSINESS_NOT_FOUND');
      }
    });
  }
}
