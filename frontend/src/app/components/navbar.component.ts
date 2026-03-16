import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LogoComponent],
  template: `
    <nav class="navbar">
      <a class="navbar-brand" [routerLink]="isAdmin ? '/admin/dashboard' : '/customer/card'">
        <app-logo
          [showAppName]="true"
          [logoSize]="themeService.getTheme().logoSize"
          [nameSize]="themeService.getTheme().nameSize"
          [align]="'left'"
          [direction]="'row'"
          [textColor]="themeService.getTheme().navbarTextColor"
          [logoMarginTop]="0">
        </app-logo>
      </a>

      <ul class="navbar-nav">
        <ng-container *ngIf="!isAdmin">
          <li><a routerLink="/customer/card" routerLinkActive="active">{{ 'nav.myCard' | translate }}</a></li>
          <li><a routerLink="/customer/qr" routerLinkActive="active">{{ 'nav.myQr' | translate }}</a></li>
        </ng-container>
        <ng-container *ngIf="isAdmin">
          <li><a routerLink="/admin/dashboard" routerLinkActive="active">{{ 'nav.dashboard' | translate }}</a></li>
          <li><a routerLink="/admin/scanner" routerLinkActive="active">{{ 'nav.scanner' | translate }}</a></li>
          <li><a routerLink="/admin/customers" routerLinkActive="active">{{ 'nav.customers' | translate }}</a></li>
          <li><a routerLink="/admin/users" routerLinkActive="active">{{ 'nav.users' | translate }}</a></li>
          <li><a routerLink="/admin/appearance" routerLinkActive="active">{{ 'nav.appearance' | translate }}</a></li>
         <li><a routerLink="/admin/fidelity-tiers" routerLinkActive="active">🎯 Fidelidad</a></li>
         <li><a routerLink="/admin/redemptions" routerLinkActive="active">🎁 Canjes</a></li>
          <li><a routerLink="/admin/settings" routerLinkActive="active">⚙️</a></li>
        </ng-container>
      </ul>

      <div class="navbar-actions">
        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
          <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="logout()">{{ 'nav.logout' | translate }}</button>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  isAdmin = false;
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private translate: TranslateService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.currentLang = localStorage.getItem('lang') || 'en';
  }

  setLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout() {
    this.authService.logout();
  }
}
