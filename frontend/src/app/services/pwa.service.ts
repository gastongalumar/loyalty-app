import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantInfo } from '../models/models';

const STATIC_MANIFEST = '/manifest.webmanifest';

/**
 * PWA por tenant:
 * - registra el service worker compartido (caches particionadas por slug);
 * - inyecta el manifest y theme-color del tenant en runtime;
 * - expone el install prompt deferido;
 * - invalida la cache del tenant al cambiar de negocio o cerrar sesión.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {

  readonly canInstall$ = new BehaviorSubject<boolean>(false);

  private deferredPrompt: any = null;
  private manifestLink: HTMLLinkElement | null = null;
  private themeColorMeta: HTMLMetaElement | null = null;
  private appleTitleMeta: HTMLMetaElement | null = null;

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

    this.ensureManifestLink();

    if (!info) {
      if (this.manifestLink) {
        this.manifestLink.href = STATIC_MANIFEST;
      }
      this.setAppleTitle('Loyalty');
      return;
    }

    if (this.manifestLink) {
      this.manifestLink.href =
        `${environment.apiUrl}/public/tenants/${info.slug}/manifest.webmanifest`;
    }

    if (!this.themeColorMeta) {
      this.themeColorMeta = document.createElement('meta');
      this.themeColorMeta.name = 'theme-color';
      document.head.appendChild(this.themeColorMeta);
    }
    const accent = info.colorPrimary
      || getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
    if (accent) {
      this.themeColorMeta.content = accent;
    }

    this.setAppleTitle(info.name);
  }

  /** Borra la cache de navegación de un tenant (al cambiar de negocio o hacer logout). */
  clearTenantCache(slug: string | null): void {
    if (!slug || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      return;
    }
    controller.postMessage({ type: 'CLEAR_TENANT', slug });
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

  private ensureManifestLink(): void {
    if (!this.manifestLink) {
      this.manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    }
    if (!this.manifestLink) {
      this.manifestLink = document.createElement('link');
      this.manifestLink.rel = 'manifest';
      document.head.appendChild(this.manifestLink);
    }
  }

  private setAppleTitle(title: string): void {
    if (!this.appleTitleMeta) {
      this.appleTitleMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="apple-mobile-web-app-title"]');
    }
    if (!this.appleTitleMeta) {
      this.appleTitleMeta = document.createElement('meta');
      this.appleTitleMeta.name = 'apple-mobile-web-app-title';
      document.head.appendChild(this.appleTitleMeta);
    }
    this.appleTitleMeta.content = title;
  }
}
