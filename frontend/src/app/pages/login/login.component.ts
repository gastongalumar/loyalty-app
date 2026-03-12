import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">☕ {{ 'APP.NAME' | translate }}</div>
        <p class="auth-tagline">{{ 'APP.TAGLINE' | translate }}</p>

        <div class="lang-row">
          <div class="lang-switcher">
            <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
            <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="email"
                 [placeholder]="'AUTH.EMAIL' | translate" />
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="password"
                 [placeholder]="'AUTH.PASSWORD' | translate"
                 (keydown.enter)="onLogin()" />
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="onLogin()">
          <span *ngIf="!loading">{{ 'AUTH.SIGN_IN' | translate }}</span>
          <span *ngIf="loading">{{ 'COMMON.LOADING' | translate }}</span>
        </button>

        <p class="auth-link">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a routerLink="/register">{{ 'AUTH.SIGN_UP' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .lang-row { display: flex; justify-content: center; margin-bottom: 20px; }
    .lang-switcher { background: #f0eeeb; padding: 3px; border-radius: 8px; display: flex; gap: 4px; }
    .lang-btn { background: none; border: none; color: #6B6B7B; font-size: 0.78rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; cursor: pointer; letter-spacing: 0.5px; transition: all 0.2s; }
    .lang-btn.active { background: var(--primary); color: white; }
    .auth-link { text-align: center; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); }
    .auth-link a { color: var(--primary); font-weight: 600; text-decoration: none; }
    .auth-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.currentLang = localStorage.getItem('lang') || 'en';
  }

  setLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  onLogin() {
    this.error = '';
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.role === 'CUSTOMER') this.router.navigate(['/customer/card']);
        else this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed';
        this.loading = false;
      }
    });
  }
}
