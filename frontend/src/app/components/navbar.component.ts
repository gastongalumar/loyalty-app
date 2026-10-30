import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { SlugService } from '../services/slug.service';
import { PwaService } from '../services/pwa.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
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

  constructor(
    private auth: AuthService,
    private slugService: SlugService,
    public readonly pwa: PwaService,
    public readonly theme: ThemeService,
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
