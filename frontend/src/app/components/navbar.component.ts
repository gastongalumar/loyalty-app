// frontend/src/app/components/navbar.component.ts

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { LogoComponent } from './logo.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LogoComponent],
  template: `
    <!-- ── Top Navbar ── -->
    <nav class="navbar">

      <!-- Brand -->
      <a class="navbar-brand" [routerLink]="isAdmin ? '/admin/dashboard' : '/customer/card'" (click)="closeDrawer()">
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

      <!-- Desktop nav links (hidden on mobile via CSS) -->
      <ul class="navbar-nav" *ngIf="isAdmin">
        <li><a routerLink="/admin/dashboard"     routerLinkActive="active">📊 Dashboard</a></li>
        <li><a routerLink="/admin/scanner"       routerLinkActive="active">📷 Scanner</a></li>
        <li><a routerLink="/admin/customers"     routerLinkActive="active">👥 Clientes</a></li>
        <li><a routerLink="/admin/fidelity-tiers"routerLinkActive="active">🎯 Fidelidad</a></li>
        <li><a routerLink="/admin/redemptions"   routerLinkActive="active">🎁 Canjes</a></li>
        <li><a routerLink="/admin/appearance"    routerLinkActive="active">🎨 Apariencia</a></li>
        <li><a routerLink="/admin/settings"      routerLinkActive="active">⚙️</a></li>
      </ul>

      <ul class="navbar-nav" *ngIf="!isAdmin">
        <li><a routerLink="/customer/card" routerLinkActive="active">🃏 Mi Tarjeta</a></li>
        <li><a routerLink="/customer/qr"   routerLinkActive="active">📱 Mi QR</a></li>
      </ul>

      <!-- Right actions -->
      <div class="navbar-actions">
        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
          <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
        </div>

        <!-- Desktop logout -->
        <button class="btn btn-ghost btn-sm desktop-only" (click)="logout()">
          Salir
        </button>

        <!-- Hamburger (mobile only) -->
        <button
          class="nav-hamburger"
          [class.open]="drawerOpen"
          (click)="toggleDrawer()"
          aria-label="Menú"
          [attr.aria-expanded]="drawerOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- ── Mobile Drawer ── -->
    <div class="nav-drawer" [class.open]="drawerOpen" role="dialog" aria-label="Menú de navegación">

      <!-- Admin menu -->
      <ng-container *ngIf="isAdmin">
        <a class="nav-drawer-item" routerLink="/admin/dashboard"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">📊</span>
          Dashboard
        </a>
        <a class="nav-drawer-item" routerLink="/admin/scanner"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">📷</span>
          Scanner QR
        </a>
        <a class="nav-drawer-item" routerLink="/admin/customers"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">👥</span>
          Clientes
        </a>
        <a class="nav-drawer-item" routerLink="/admin/users"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">👤</span>
          Usuarios
        </a>

        <div class="nav-drawer-divider"></div>

        <a class="nav-drawer-item" routerLink="/admin/fidelity-tiers"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">🎯</span>
          Recompensas de Fidelidad
        </a>
        <a class="nav-drawer-item" routerLink="/admin/redemptions"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">🎁</span>
          Canjes
        </a>

        <div class="nav-drawer-divider"></div>

        <a class="nav-drawer-item" routerLink="/admin/appearance"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">🎨</span>
          Apariencia
        </a>
        <a class="nav-drawer-item" routerLink="/admin/settings"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">⚙️</span>
          Configuración
        </a>
      </ng-container>

      <!-- Customer menu -->
      <ng-container *ngIf="!isAdmin">
        <a class="nav-drawer-item" routerLink="/customer/card"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">🃏</span>
          Mi Tarjeta
        </a>
        <a class="nav-drawer-item" routerLink="/customer/qr"
           routerLinkActive="active" (click)="closeDrawer()">
          <span class="nav-drawer-icon">📱</span>
          Mi Código QR
        </a>
      </ng-container>

      <!-- Footer with lang + logout -->
      <div class="nav-drawer-footer">
        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="setLang('en')">EN</button>
          <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="setLang('es')">ES</button>
        </div>
        <button class="btn btn-danger btn-sm" (click)="logout()">
          Cerrar sesión
        </button>
      </div>
    </div>

    <!-- Drawer backdrop -->
    <div
      *ngIf="drawerOpen"
      class="nav-drawer-backdrop"
      (click)="closeDrawer()">
    </div>
  `,
  styles: [`
    /* Backdrop */
    .nav-drawer-backdrop {
      position:   fixed;
      inset:      0;
      background: rgba(0,0,0,0.5);
      z-index:    189;
      backdrop-filter: blur(2px);
      animation:  fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* Hide hamburger on desktop */
    @media (min-width: 768px) {
      .nav-hamburger      { display: none !important; }
      .nav-drawer         { display: none !important; }
      .nav-drawer-backdrop{ display: none !important; }
    }

    /* Hide desktop logout on mobile */
    .desktop-only {
      display: none;
    }

    @media (min-width: 768px) {
      .desktop-only { display: inline-flex; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin       = false;
  currentLang   = 'en';
  drawerOpen    = false;
  private routerSub!: Subscription;

  constructor(
    private authService:  AuthService,
    private translate:    TranslateService,
    private router:       Router,
    public  themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isAdmin     = this.authService.isAdmin();
    this.currentLang = localStorage.getItem('lang') || 'en';

    // Close drawer on route change
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeDrawer());
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    document.body.style.overflow = this.drawerOpen ? 'hidden' : '';
  }

  closeDrawer() {
    this.drawerOpen = false;
    document.body.style.overflow = '';
  }

  // Close drawer on Escape key
  @HostListener('document:keydown.escape')
  onEscape() { this.closeDrawer(); }

  setLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout() {
    this.closeDrawer();
    this.authService.logout();
  }
}
