import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddStampRequest, Customer, LoyaltyCard, Page, ScanQrRequest
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly CUSTOMER_API = `${environment.apiUrl}/v1/customer`;
  private readonly BUSINESS_API = `${environment.apiUrl}/v1/business`;

  constructor(private http: HttpClient) {}

  // Customer endpoints (tenant + user come from the JWT)
  getMyCard(): Observable<LoyaltyCard> {
    return this.http.get<LoyaltyCard>(`${this.CUSTOMER_API}/card`);
  }

  getMyQrCode(): Observable<string> {
    return this.http.get(`${this.CUSTOMER_API}/qr`, { responseType: 'text' });
  }

  // Business endpoints
  getCustomers(query?: string, page = 0, size = 20): Observable<Page<Customer>> {
    const params: Record<string, string | number> = { page, size };
    if (query) {
      params['q'] = query;
    }
    return this.http.get<Page<Customer>>(`${this.BUSINESS_API}/customers`, { params });
  }

  getCustomerCard(userId: number): Observable<LoyaltyCard> {
    return this.http.get<LoyaltyCard>(`${this.BUSINESS_API}/customers/${userId}/card`);
  }

  getCustomerQr(userId: number): Observable<{ qrCode: string }> {
    return this.http.get<{ qrCode: string }>(`${this.BUSINESS_API}/customers/${userId}/qr`);
  }

  addStamp(request: AddStampRequest): Observable<LoyaltyCard> {
    return this.http.post<LoyaltyCard>(`${this.BUSINESS_API}/stamps`, request);
  }

  scanQrAndAddStamp(request: ScanQrRequest): Observable<LoyaltyCard> {
    return this.http.post<LoyaltyCard>(`${this.BUSINESS_API}/stamps/scan`, request);
  }
}
