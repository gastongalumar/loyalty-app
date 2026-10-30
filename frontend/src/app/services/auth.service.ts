import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, Role } from '../models/models';
import { PwaService } from './pwa.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router, private pwa: PwaService) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, request)
      .pipe(tap(res => this.saveSession(res)));
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request)
      .pipe(tap(res => this.saveSession(res)));
  }

  logout(): void {
    const wasPlatform = this.isPlatformAdmin();
    const slug = this.getTenantSlug();
    this.pwa.clearTenantCache(slug);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(wasPlatform ? ['/platform/login'] : ['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthResponse | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as AuthResponse : null;
  }

  getRole(): Role | null {
    return this.getUser()?.role ?? null;
  }

  getTenantSlug(): string | null {
    return this.getUser()?.tenantSlug ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }

  isBusinessAdmin(): boolean {
    return this.getRole() === 'BUSINESS_ADMIN';
  }

  isPlatformAdmin(): boolean {
    return this.getRole() === 'PLATFORM_ADMIN';
  }

  homeRoute(): string[] {
    if (this.isPlatformAdmin()) {
      return ['/platform/businesses'];
    }
    const slug = this.getTenantSlug();
    if (!slug) {
      return ['/'];
    }
    return this.isCustomer()
      ? ['/', slug, 'customer', 'card']
      : ['/', slug, 'business', 'dashboard'];
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res));
  }
}
