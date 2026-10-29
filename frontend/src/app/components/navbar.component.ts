import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SlugService } from '../services/slug.service';
import { PwaService } from '../services/pwa.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <nav class="navbar">
      <a class="navbar-brand" [routerLink]="home">
        <img *ngIf="logoUrl" [src]="logoUrl" alt="" style="height:26px;width:auto;border-radius:4px;margin-right:8px;" />
        <span>{{ businessName || ('APP.NAME' | translate) }}</span>
        <span *ngIf="slug" style="opacity:.6;font-weight:500;"> · {{ slug }}</span>
      </a>

      <ul class="navbar-nav">
        <ng-container *ngIf="isCustomer">
          <li><a [routerLink]="['/', slug, 'customer', 'card']" routerLinkActive="active">{{ 'NAV.MY_CARD' | translate }}</a></li>
          <li><a [routerLink]="['/', slug, 'customer', 'qr']" routerLinkActive="active">{{ 'NAV.MY_QR' | translate }}</a></li>
        </ng-container>
        <ng-container *ngIf="isBusinessAdmin">
          <li><a [routerLink]="['/', slug, 'business', 'dashboard']" routerLinkActive="active">{{ 'NAV.DASHBOARD' | translate }}</a></li>
          <li><a [routerLink]="['/', slug, 'business', 'customers']" routerLinkActive="active">{{ 'NAV.CUSTOMERS' | translate }}</a></li>
          <li><a [routerLink]="['/', slug, 'business', 'scanner']" routerLinkActive="active">{{ 'NAV.SCANNER' | translate }}</a></li>
          <li><a [routerLink]="['/', slug, 'business', 'rewards']" routerLinkActive="active">{{ 'NAV.REWARDS' | translate }}</a></li>
          <li><a [routerLink]="['/', slug, 'business', 'settings']" routerLinkActive="active">{{ 'NAV.SETTINGS' | translate }}</a></li>
        </ng-container>
        <ng-container *ngIf="isPlatformAdmin">
          <li><a routerLink="/platform/businesses" routerLinkActive="active">{{ 'NAV.BUSINESSES' | translate }}</a></li>
        </ng-container>
      </ul>

      <div class="navbar-actions">
        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
          <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
        </div>
        <button *ngIf="pwa.canInstall$ | async" class="btn btn-outline btn-sm" (click)="pwa.install()">
          {{ 'PWA.INSTALL' | translate }}
        </button>
        <button class="btn btn-ghost btn-sm" (click)="logout()">{{ 'NAV.LOGOUT' | translate }}</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  isCustomer = this.auth.isCustomer();
  isBusinessAdmin = this.auth.isBusinessAdmin();
  isPlatformAdmin = this.auth.isPlatformAdmin();
  slug = this.auth.getTenantSlug() ?? this.slugService.get() ?? '';
  home = this.auth.homeRoute();
  currentLang = localStorage.getItem('lang') || 'en';
  businessName = this.slugService.getTenant()?.name ?? '';
  logoUrl = this.slugService.getTenant()?.logoUrl ?? null;

  constructor(
    private auth: AuthService,
    private slugService: SlugService,
    public readonly pwa: PwaService,
    private translate: TranslateService
  ) {}

  setLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout(): void {
    this.slugService.clear();
    this.auth.logout();
  }
}
