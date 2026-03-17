// frontend/src/app/services/loyalty.service.ts
// ✅ BUG FIX #5: getMyCard() now uses tap() to push fresh data into a
// BehaviorSubject (card$). Components that subscribe to card$ automatically
// re-render when a new reward is earned (e.g. after requestFidelityRedemption).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddStampRequest, Customer, FidelityReward, LoyaltyCard, ScanQrRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {

  private readonly CUSTOMER_API = `${environment.apiUrl}/customer`;
  private readonly ADMIN_API    = `${environment.apiUrl}/admin`;

  // ✅ BUG FIX #5: Reactive card stream — push updates here so UI refreshes
  // automatically whenever the card data changes (new reward, new stamp, etc.)
  private _card$ = new BehaviorSubject<LoyaltyCard | null>(null);
  /** Reactive stream of the current customer's loyalty card. Subscribe to this
   *  in components instead of calling getMyCard() directly in templates. */
  readonly card$ = this._card$.asObservable();

  constructor(private http: HttpClient) {}

  /** Fetch the authenticated customer's loyalty card and push to card$ stream. */
  getMyCard(): Observable<LoyaltyCard> {
    return this.http.get<LoyaltyCard>(`${this.CUSTOMER_API}/card`).pipe(
      // ✅ BUG FIX #5: Side-effect pushes result into the BehaviorSubject,
      // so any template bound to card$ re-renders without extra subscriptions.
      tap(card => this._card$.next(card))
    );
  }

  /** Force-refresh the card (e.g. after a redemption request). */
  refreshCard(): void {
    this.getMyCard().subscribe();
  }

  getMyQrCode(): Observable<string> {
    return this.http.get(`${this.CUSTOMER_API}/qr`, { responseType: 'text' });
  }

  /**
   * Request redemption of a standard card reward or a fidelity reward.
   * ✅ BUG FIX #5: After a successful request, refreshCard() is called so
   * the UI updates the reward status badge without a manual page reload.
   */
  requestRedemption(request: { rewardId: number; rewardType: 'CARD' | 'FIDELITY' }): Observable<any> {
    return this.http.post(`${this.CUSTOMER_API}/redemptions/request`, request).pipe(
      tap(() => this.refreshCard())
    );
  }

  // ── Admin endpoints ──────────────────────────────────────────────────────────

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
