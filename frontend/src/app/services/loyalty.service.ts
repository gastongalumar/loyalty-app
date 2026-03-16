import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddStampRequest, Customer, LoyaltyCard, ScanQrRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly CUSTOMER_API = `${environment.apiUrl}/customer`;
  private readonly ADMIN_API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Customer endpoints
  getMyCard(): Observable<LoyaltyCard> {
    return this.http.get<LoyaltyCard>(`${this.CUSTOMER_API}/card`);
  }

  getMyQrCode(): Observable<string> {
    return this.http.get(`${this.CUSTOMER_API}/qr`, { responseType: 'text' });
  }

  // NUEVO: Solicitar canje de recompensa
  requestRedemption(request: { rewardId: number, rewardType: string }): Observable<any> {
    return this.http.post(`${this.CUSTOMER_API}/redemptions/request`, request);
  }

  // Admin endpoints
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.ADMIN_API}/customers`);
  }

  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.ADMIN_API}/customers/search`, {
      params: { q: query }
    });
  }

  getCustomerCard(userId: number): Observable<LoyaltyCard> {
    return this.http.get<LoyaltyCard>(`${this.ADMIN_API}/customers/${userId}/card`);
  }

  addStamp(request: AddStampRequest): Observable<LoyaltyCard> {
    return this.http.post<LoyaltyCard>(`${this.ADMIN_API}/stamps`, request);
  }

  scanQrAndAddStamp(request: ScanQrRequest): Observable<LoyaltyCard> {
    return this.http.post<LoyaltyCard>(`${this.ADMIN_API}/stamps/scan`, request);
  }

  getCustomerQr(userId: number): Observable<{ qrCode: string }> {
    return this.http.get<{ qrCode: string }>(`${this.ADMIN_API}/customers/${userId}/qr`);
  }
}
