import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantInfo } from '../models/models';

/**
 * PWA per tenant:
 * - registers the shared service worker (caches are partitioned by slug);
 * - injects the tenant manifest and theme-color at runtime;
 * - exposes the deferred install prompt.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {

  readonly canInstall$ = new BehaviorSubject<boolean>(false);

  private deferredPrompt: any = null;
  private manifestLink: HTMLLinkElement | null = null;
  private themeColorMeta: HTMLMetaElement | null = null;

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.canInstall$.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall$.next(false);
    });
  }

  register(): void {
    if (!environment.production || !('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch(() => undefined);
  }

  applyTenant(info: TenantInfo | null): void {
    if (!environment.production) {
      // En dev la API vive en otro origen (:8080) y el manifest quedaría cross-origin.
      return;
    }

    if (!info) {
      this.manifestLink?.remove();
      this.manifestLink = null;
      return;
    }

    if (!this.manifestLink) {
      this.manifestLink = document.createElement('link');
      this.manifestLink.rel = 'manifest';
      document.head.appendChild(this.manifestLink);
    }
    this.manifestLink.href =
      `${environment.apiUrl}/public/tenants/${info.slug}/manifest.webmanifest`;

    if (!this.themeColorMeta) {
      this.themeColorMeta = document.createElement('meta');
      this.themeColorMeta.name = 'theme-color';
      document.head.appendChild(this.themeColorMeta);
    }
    this.themeColorMeta.content = info.colorPrimary || '#FF6B35';
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }
    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall$.next(false);
  }
}
