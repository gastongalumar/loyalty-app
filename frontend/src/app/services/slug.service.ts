import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TenantInfo } from '../models/models';

/**
 * Resolves the tenant slug from the /:slug path segment.
 * The slug is the single source of truth for public auth calls and navigation.
 */
@Injectable({ providedIn: 'root' })
export class SlugService {
  private static readonly KEY = 'tenantSlug';
  private static readonly RESERVED = ['platform', 'api', 'assets', 'login', 'register', 'admin', 'customer'];

  private current: string | null = sessionStorage.getItem(SlugService.KEY);

  constructor(private http: HttpClient) {}

  get(): string | null {
    return this.current;
  }

  isReserved(slug: string): boolean {
    return SlugService.RESERVED.includes(slug);
  }

  validate(slug: string): Observable<TenantInfo> {
    return this.http.get<TenantInfo>(`${environment.apiUrl}/public/tenants/${slug}`)
      .pipe(tap(info => this.set(info.slug)));
  }

  set(slug: string): void {
    this.current = slug;
    sessionStorage.setItem(SlugService.KEY, slug);
  }

  clear(): void {
    this.current = null;
    sessionStorage.removeItem(SlugService.KEY);
  }
}
