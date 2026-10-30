import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';
import { ThemeService } from '../../services/theme.service';
import { PwaService } from '../../services/pwa.service';

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
    private router: Router
  ) {
    // A platform login must never carry a tenant slug, branding or manifest from a previous session.
    this.slugService.clear();
    this.themeService.reset();
    this.pwaService.applyTenant(null);
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
          this.error = 'Not a platform administrator';
          this.auth.logout();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
