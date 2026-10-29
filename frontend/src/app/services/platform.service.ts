import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Admin, Business, BusinessSummary, Page } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly API = `${environment.apiUrl}/v1/platform/businesses`;

  constructor(private http: HttpClient) {}

  list(status?: string, q?: string, page = 0, size = 20): Observable<Page<BusinessSummary>> {
    const params: Record<string, string | number> = { page, size };
    if (status) {
      params['status'] = status;
    }
    if (q) {
      params['q'] = q;
    }
    return this.http.get<Page<BusinessSummary>>(this.API, { params });
  }

  get(id: number): Observable<Business> {
    return this.http.get<Business>(`${this.API}/${id}`);
  }

  create(payload: Partial<Business>): Observable<Business> {
    return this.http.post<Business>(this.API, payload);
  }

  updateStatus(id: number, status: 'ACTIVE' | 'SUSPENDED'): Observable<Business> {
    return this.http.patch<Business>(`${this.API}/${id}/status`, { status });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  listAdmins(id: number): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.API}/${id}/admins`);
  }

  createAdmin(id: number, payload: {
    email: string; password: string; firstName: string; lastName: string; phone?: string;
  }): Observable<Admin> {
    return this.http.post<Admin>(`${this.API}/${id}/admins`, payload);
  }

  // Business self-service (BUSINESS_ADMIN)
  getMyBusiness(): Observable<Business> {
    return this.http.get<Business>(`${environment.apiUrl}/v1/business/me`);
  }

  updateMyBusiness(payload: Partial<Business>): Observable<Business> {
    return this.http.put<Business>(`${environment.apiUrl}/v1/business/me`, payload);
  }
}
