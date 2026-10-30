import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantInfo } from '../models/models';
import { PwaService } from './pwa.service';

/**
 * Resolves the tenant slug from the /:slug path segment and keeps the last
 * validated tenant (name, branding) in memory for the shell/navbar.
 */
@Injectable({ providedIn: 'root' })
export class SlugService {
  private static readonly KEY = 'tenantSlug';
  private static readonly RESERVED = ['platform', 'api', 'assets', 'login', 'register', 'admin', 'customer'];

  private current: string | null = sessionStorage.getItem(SlugService.KEY);
  private currentTenant: TenantInfo | null = null;

  constructor(private http: HttpClient, private pwa: PwaService) {}

  get(): string | null {
    return this.current;
  }

  getTenant(): TenantInfo | null {
    return this.currentTenant;
  }

  isReserved(slug: string): boolean {
    return SlugService.RESERVED.includes(slug);
  }

  validate(slug: string): Observable<TenantInfo> {
    return this.http.get<TenantInfo>(`${environment.apiUrl}/public/tenants/${slug}`)
      .pipe(tap(info => {
        if (this.current && this.current !== info.slug) {
          // Nunca reutilizar la cache de navegación de otro tenant.
          this.pwa.clearTenantCache(this.current);
        }
        this.set(info.slug);
        this.currentTenant = info;
      }));
  }

  set(slug: string): void {
    this.current = slug;
    sessionStorage.setItem(SlugService.KEY, slug);
  }

  clear(): void {
    this.pwa.clearTenantCache(this.current);
    this.current = null;
    this.currentTenant = null;
    sessionStorage.removeItem(SlugService.KEY);
  }
}
