import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <nav class="navbar">
      <a class="navbar-brand" [routerLink]="isAdmin ? '/admin/dashboard' : '/customer/card'">
        ☕ {{ 'APP.NAME' | translate }}
      </a>

      <ul class="navbar-nav">
        <ng-container *ngIf="!isAdmin">
          <li><a routerLink="/customer/card" routerLinkActive="active">{{ 'NAV.MY_CARD' | translate }}</a></li>
          <li><a routerLink="/customer/qr" routerLinkActive="active">{{ 'NAV.MY_QR' | translate }}</a></li>
        </ng-container>
        <ng-container *ngIf="isAdmin">
          <li><a routerLink="/admin/dashboard" routerLinkActive="active">{{ 'NAV.DASHBOARD' | translate }}</a></li>
          <li><a routerLink="/admin/scanner" routerLinkActive="active">{{ 'NAV.SCANNER' | translate }}</a></li>
          <li><a routerLink="/admin/customers" routerLinkActive="active">{{ 'NAV.CUSTOMERS' | translate }}</a></li>
          <li><a routerLink="/admin/settings" routerLinkActive="active">⚙️</a></li>
        </ng-container>
      </ul>

      <div class="navbar-actions">
        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
          <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="logout()">{{ 'NAV.LOGOUT' | translate }}</button>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  isAdmin = false;
  currentLang = 'en';

  constructor(private authService: AuthService, private translate: TranslateService) {}

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
