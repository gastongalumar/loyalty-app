import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SlugService } from '../services/slug.service';
import { PwaService } from '../services/pwa.service';
import { THEME_OPTIONS, ThemeMode, ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isCustomer = this.auth.isCustomer();
  isBusinessAdmin = this.auth.isBusinessAdmin();
  isPlatformAdmin = this.auth.isPlatformAdmin();
  slug = this.isPlatformAdmin
    ? ''
    : (this.auth.getTenantSlug() ?? this.slugService.get() ?? '');
  home = this.auth.homeRoute();
  currentLang = localStorage.getItem('lang') || 'en';
  businessName = this.slugService.getTenant()?.name ?? '';
  logoUrl = this.slugService.getTenant()?.logoUrl ?? null;
  readonly themeOptions = THEME_OPTIONS;
  themeMenuOpen = false;

  constructor(
    private auth: AuthService,
    private slugService: SlugService,
    public readonly pwa: PwaService,
    public readonly theme: ThemeService,
    private translate: TranslateService
  ) {
    this.theme.init();
  }

  ngOnInit(): void {
    this.theme.init();
  }

  get currentMode(): ThemeMode {
    return this.theme.getMode();
  }

  get currentThemeLabelKey(): string {
    return this.themeOptions.find(option => option.id === this.currentMode)?.labelKey
      ?? 'THEME.SYSTEM';
  }

  toggleThemeMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.themeMenuOpen = !this.themeMenuOpen;
  }

  selectTheme(mode: ThemeMode, event: MouseEvent): void {
    event.stopPropagation();
    this.theme.setMode(mode);
    this.themeMenuOpen = false;
  }

  @HostListener('document:click')
  closeThemeMenu(): void {
    this.themeMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeThemeMenuOnEscape(): void {
    this.themeMenuOpen = false;
  }

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
