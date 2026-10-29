import { Injectable } from '@angular/core';
import { TenantInfo } from '../models/models';

/**
 * Applies per-tenant branding as CSS custom properties.
 * No upload/storage: the logo is a remote URL (R2 scope).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private static readonly VARS = [
    '--primary', '--primary-dark', '--primary-light', '--secondary', '--tenant-logo'
  ];

  apply(info: TenantInfo | null): void {
    const root = document.documentElement;

    if (!info) {
      this.reset();
      return;
    }

    if (info.colorPrimary && this.isHex(info.colorPrimary)) {
      root.style.setProperty('--primary', info.colorPrimary);
      root.style.setProperty('--primary-dark', adjust(info.colorPrimary, -22));
      root.style.setProperty('--primary-light', tint(info.colorPrimary, 0.88));
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-dark');
      root.style.removeProperty('--primary-light');
    }

    if (info.colorSecondary && this.isHex(info.colorSecondary)) {
      root.style.setProperty('--secondary', info.colorSecondary);
    } else {
      root.style.removeProperty('--secondary');
    }

    if (info.logoUrl) {
      root.style.setProperty('--tenant-logo', `url("${info.logoUrl}")`);
    } else {
      root.style.removeProperty('--tenant-logo');
    }
  }

  reset(): void {
    const root = document.documentElement;
    ThemeService.VARS.forEach(variable => root.style.removeProperty(variable));
  }

  private isHex(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }
}

function adjust(hex: string, amount: number): string {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = clamp((value >> 16) + amount);
  const g = clamp(((value >> 8) & 0x00ff) + amount);
  const b = clamp((value & 0x0000ff) + amount);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function tint(hex: string, ratio: number): string {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = clamp(Math.round(((value >> 16) & 0xff) + (255 - ((value >> 16) & 0xff)) * ratio));
  const g = clamp(Math.round(((value >> 8) & 0xff) + (255 - ((value >> 8) & 0xff)) * ratio));
  const b = clamp(Math.round((value & 0xff) + (255 - (value & 0xff)) * ratio));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}
