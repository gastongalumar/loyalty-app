import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlatformSettings } from '../models/models';
import { ThemeService } from './theme.service';

/**
 * Branding global de la plataforma (landing, login de plataforma y panel maestro).
 * Es independiente del branding de cada negocio.
 */
@Injectable({ providedIn: 'root' })
export class PlatformBrandingService {

  private readonly API = `${environment.apiUrl}/public/platform`;
  private readonly subject = new BehaviorSubject<PlatformSettings | null>(null);
  readonly current$ = this.subject.asObservable();
  private loading = false;
  private loaded = false;

  constructor(private http: HttpClient, private theme: ThemeService) {}

  get current(): PlatformSettings | null {
    return this.subject.value;
  }

  get appName(): string {
    return this.current?.appName?.trim() || 'Loyalty Card';
  }

  get tagline(): string {
    return this.current?.tagline?.trim() || '';
  }

  get logoUrl(): string | null {
    return this.current?.logoUrl || null;
  }

  loadAndApply(force = false): void {
    if (this.loading) {
      return;
    }
    if (this.loaded && !force) {
      this.applyTheme();
      return;
    }

    this.loading = true;
    this.http.get<PlatformSettings>(this.API).subscribe({
      next: (settings) => {
        this.loading = false;
        this.loaded = true;
        this.subject.next(settings);
        this.applyTheme();
      },
      error: () => {
        this.loading = false;
        this.applyTheme();
      }
    });
  }

  set(settings: PlatformSettings): void {
    this.loaded = true;
    this.subject.next(settings);
    this.applyTheme();
  }

  applyTheme(): void {
    const settings = this.current;
    if (!settings) {
      return;
    }
    this.theme.apply({
      slug: 'platform',
      name: settings.appName || 'Loyalty Card',
      status: 'ACTIVE',
      colorPrimary: settings.colorPrimary,
      colorSecondary: settings.colorSecondary,
      logoUrl: settings.logoUrl,
      backgroundUrl: settings.backgroundUrl,
      backgroundVisibility: settings.backgroundVisibility,
      backgroundBlur: settings.backgroundBlur,
      stampIcon: null,
      rewardIcon: null
    });
  }
}
