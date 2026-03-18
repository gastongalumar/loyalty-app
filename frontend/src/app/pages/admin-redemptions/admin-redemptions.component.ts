import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar.component';
import { AlertComponent } from '../../components/alert.component';
import { LoadingComponent } from '../../components/loading.component';
import { environment } from '../../../environments/environment';

interface RedemptionRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  description: string;
  type: 'CARD' | 'FIDELITY';
  requestedAt: string;
  status: string;
  cardsRequired?: number;
}

@Component({
  selector: 'app-admin-redemptions',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavbarComponent, AlertComponent, LoadingComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top:24px; padding-bottom:48px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" class="page-back">← {{ 'common.back' | translate }}</a>
        <h1 class="page-title">🎁 Solicitudes de canje</h1>
        <p class="page-subtitle">Aprobá o rechazá las recompensas solicitadas.</p>
      </div>

      <app-loading *ngIf="loading"></app-loading>
      <app-alert [message]="successMsg" type="success" (dismissed)="successMsg = ''"></app-alert>
      <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg = ''"></app-alert>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab-btn" [class.tab-active]="activeTab==='pending'" (click)="activeTab='pending'; loadRequests()">⏳ Pendientes</button>
        <button class="tab-btn" [class.tab-active]="activeTab==='approved'" (click)="activeTab='approved'; loadRequests()">✅ Aprobados</button>
        <button class="tab-btn" [class.tab-active]="activeTab==='rejected'" (click)="activeTab='rejected'; loadRequests()">❌ Rechazados</button>
      </div>

      <div class="card fade-in">
        <div *ngIf="requests.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-title">
            No hay solicitudes {{ activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas' }}
          </div>
        </div>

        <div *ngFor="let req of requests" class="req-item">
          <!-- Fila superior: ícono + info -->
          <div class="req-top">
            <div class="req-icon">{{ req.type === 'CARD' ? '🎁' : '🏆' }}</div>
            <div class="req-info">
              <div class="req-name">{{ req.customerName }}</div>
              <div class="req-email">{{ req.customerEmail }}</div>
              <div class="req-desc">{{ req.description }}</div>
              <div class="req-meta">
                {{ req.requestedAt | date:'dd/MM/yyyy HH:mm' }}
                <span *ngIf="req.type === 'FIDELITY'"> · 🎯 {{ req.cardsRequired }} tarjetas</span>
              </div>
            </div>
          </div>

          <!-- Fila inferior: siempre visible -->
          <div class="req-actions" *ngIf="activeTab === 'pending'">
            <button class="btn btn-sm btn-approve" (click)="approveRequest(req)">✅ Aprobar</button>
            <button class="btn btn-sm btn-reject" (click)="rejectRequest(req)">❌ Rechazar</button>
          </div>

          <div class="req-status" *ngIf="activeTab !== 'pending'">
            <span *ngIf="activeTab === 'approved'" class="badge badge-success">✅ Aprobado</span>
            <span *ngIf="activeTab === 'rejected'" class="badge badge-danger">❌ Rechazado</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``
  + `
  .tab-bar { display:flex; gap:8px; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:8px; }
  .tab-btn { background:transparent; border:none; padding:8px 14px; border-radius:var(--r-sm); cursor:pointer; font-family:var(--font-body); font-size:0.85rem; font-weight:600; color:var(--text-secondary); transition:all 0.2s; }
  .tab-btn:hover { color:var(--text-primary); }
  .tab-active { background:var(--primary); color:white !important; }
  .req-item { padding:14px 0; border-bottom:1px solid var(--border); }
  .req-item:last-child { border-bottom:none; }
  .req-top { display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; }
  .req-icon { width:44px; height:44px; border-radius:50%; background:var(--primary-light); display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
  .req-info { flex:1; min-width:0; }
  .req-name { font-weight:600; font-size:0.9rem; }
  .req-email { font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .req-desc { font-size:0.88rem; margin:3px 0; }
  .req-meta { font-size:0.72rem; color:var(--text-muted); }
  .req-actions { display:flex; gap:8px; }
  .btn-approve { flex:1; background:#4caf50; color:white; }
  .btn-reject { flex:1; background:#dc3545; color:white; }
  .req-status { display:flex; justify-content:flex-end; }
  `]
})
export class AdminRedemptionsComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/admin/redemptions`;

  requests: RedemptionRequest[] = [];
  loading = true;
  successMsg = '';
  errorMsg = '';
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.http.get<RedemptionRequest[]>(`${this.apiUrl}?status=${this.activeTab}`).subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar solicitudes';
        this.loading = false;
      }
    });
  }

  approveRequest(req: RedemptionRequest) {
    this.http.post(`${this.apiUrl}/${req.id}/approve`, { rewardType: req.type }).subscribe({
      next: () => {
        this.successMsg = 'Solicitud aprobada';
        this.loadRequests();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al aprobar';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  rejectRequest(req: RedemptionRequest) {
    const reason = prompt('Motivo del rechazo (opcional):');
    this.http.post(`${this.apiUrl}/${req.id}/reject`, { reason, rewardType: req.type }).subscribe({
      next: () => {
        this.successMsg = 'Solicitud rechazada';
        this.loadRequests();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al rechazar';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}
