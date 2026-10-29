import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page, Reward } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly API = `${environment.apiUrl}/v1/rewards`;

  constructor(private http: HttpClient) {}

  list(status?: string, cardId?: number, page = 0, size = 20): Observable<Page<Reward>> {
    const params: Record<string, string | number> = { page, size };
    if (status) {
      params['status'] = status;
    }
    if (cardId) {
      params['cardId'] = cardId;
    }
    return this.http.get<Page<Reward>>(this.API, { params });
  }

  redeem(id: number): Observable<Reward> {
    return this.http.post<Reward>(`${this.API}/${id}/redeem`, {});
  }
}
