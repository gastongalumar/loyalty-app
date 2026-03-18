import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LogoComponent } from '../../components/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LogoComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">

        <app-logo
          [showAppName]="true"
          [logoSize]="loginLogoSize"
          [nameSize]="28"
          [align]="'center'"
          [direction]="'column'"
          [textColor]="'var(--primary)'">
        </app-logo>

        <p class="auth-tagline">{{ 'auth.welcomeBack' | translate }}</p>

        <div class="lang-row">
          <div class="lang-switcher">
            <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
            <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>

        <div class="form-group">
          <label class="form-label">{{ 'auth.email' | translate }}</label>
          <input type="email" class="form-control" [(ngModel)]="email"
                 [placeholder]="'auth.email' | translate">
        </div>

        <div class="form-group">
          <label class="form-label">{{ 'auth.password' | translate }}</label>
          <input type="password" class="form-control" [(ngModel)]="password"
                 [placeholder]="'auth.password' | translate"
                 (keydown.enter)="onLogin()">
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="loading" (click)="onLogin()">
          <span *ngIf="!loading">{{ 'auth.signIn' | translate }}</span>
          <span *ngIf="loading">{{ 'auth.signingIn' | translate }}</span>
        </button>

        <p class="auth-link">
          {{ 'auth.noAccount' | translate }}
          <a routerLink="/register">{{ 'auth.signUp' | translate }}</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  loading = false;
  error = '';
  currentLang = 'en';
  loginLogoSize = 80;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentLang = localStorage.getItem('lang') || 'en';
    // Suscripción reactiva — se actualiza cuando el tema llega del servidor
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.loginLogoSize = theme.loginLogoSize || 80;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        if (res.role === 'CUSTOMER') {
          this.router.navigate(['/customer/card']);
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}
