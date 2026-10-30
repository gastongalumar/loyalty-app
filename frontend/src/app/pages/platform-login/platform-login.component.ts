import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';
import { ThemeService } from '../../services/theme.service';
import { PwaService } from '../../services/pwa.service';
import { PlatformBrandingService } from '../../services/platform-branding.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './platform-login.component.html',
  styleUrls: ['./platform-login.component.css']
})
export class PlatformLoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private slugService: SlugService,
    private themeService: ThemeService,
    private pwaService: PwaService,
    private platformBranding: PlatformBrandingService,
    private router: Router,
    private translate: TranslateService
  ) {
    // A platform login must never carry a tenant slug, branding or manifest from a previous session.
    this.slugService.clear();
    this.themeService.reset();
    this.pwaService.applyTenant(null);
    this.platformBranding.loadAndApply(true);
  }

  get platformName(): string {
    return this.platformBranding.appName || this.translate.instant('APP.NAME');
  }

  get platformLogo(): string | null {
    return this.platformBranding.logoUrl;
  }

  get platformTagline(): string {
    return this.platformBranding.tagline || this.translate.instant('PLATFORM.LOGIN_TITLE');
  }

  login(): void {
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'PLATFORM_ADMIN') {
          this.router.navigate(['/platform/businesses']);
        } else {
          this.error = this.translate.instant('ERRORS.PLATFORM_ROLE');
          this.auth.logout();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || this.translate.instant('ERRORS.LOGIN');
      }
    });
  }
}
