import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">{{ 'APP.NAME' | translate }}</div>
        <p class="auth-tagline">{{ slug }}</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="email" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="password"
                 (keydown.enter)="onLogin()" />
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="onLogin()">
          {{ loading ? ('COMMON.LOADING' | translate) : ('AUTH.SIGN_IN' | translate) }}
        </button>

        <p class="auth-link">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a [routerLink]="['/', slug, 'register']">{{ 'AUTH.SIGN_UP' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-link { text-align: center; margin-top: 20px; font-size: 0.9rem; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  slug = this.slugService.get() ?? '';

  constructor(
    private authService: AuthService,
    private slugService: SlugService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(this.authService.homeRoute());
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
