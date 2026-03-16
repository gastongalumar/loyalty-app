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

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 48px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" style="font-size:0.875rem; color:var(--text-muted); text-decoration:none; display:inline-block; margin-bottom:8px;">
          ← {{ 'common.back' | translate }}
        </a>
        <h1 class="page-title">🎁 Solicitudes de canje</h1>
        <p class="page-subtitle">Aprobá o rechazá las recompensas que los clientes quieren canjear.</p>
      </div>

      <app-loading *ngIf="loading"></app-loading>
      <app-alert [message]="successMsg" type="success" (dismissed)="successMsg = ''"></app-alert>
      <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg = ''"></app-alert>

      <!-- Pestañas -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border);">
        <button class="btn"
                [style.background]="activeTab === 'pending' ? 'var(--primary)' : 'transparent'"
                [style.color]="activeTab === 'pending' ? 'white' : 'var(--text-secondary)'"
                (click)="activeTab = 'pending'; loadRequests()">
          ⏳ Pendientes
        </button>
        <button class="btn"
                [style.background]="activeTab === 'approved' ? 'var(--primary)' : 'transparent'"
                [style.color]="activeTab === 'approved' ? 'white' : 'var(--text-secondary)'"
                (click)="activeTab = 'approved'; loadRequests()">
          ✅ Aprobados
        </button>
        <button class="btn"
                [style.background]="activeTab === 'rejected' ? 'var(--primary)' : 'transparent'"
                [style.color]="activeTab === 'rejected' ? 'white' : 'var(--text-secondary)'"
                (click)="activeTab = 'rejected'; loadRequests()">
          ❌ Rechazados
        </button>
      </div>

      <!-- Lista de solicitudes -->
      <div class="card fade-in">
        <div *ngIf="requests.length === 0" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No hay solicitudes {{ activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas' }}
        </div>

        <div *ngFor="let req of requests" class="request-item"
             style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px;">

          <!-- Avatar/Icono -->
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-light);
                      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            {{ req.type === 'CARD' ? '🎁' : '🏆' }}
          </div>

          <!-- Info del cliente y recompensa -->
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 600;">{{ req.customerName }}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">({{ req.customerEmail }})</span>
            </div>
            <div style="font-size: 0.9rem; margin-bottom: 4px;">{{ req.description }}</div>
            <div style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-muted);">
              <span>Solicitado: {{ req.requestedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              <span *ngIf="req.type === 'FIDELITY'">🎯 {{ req.cardsRequired }} tarjetas</span>
            </div>
          </div>

          <!-- Acciones (solo para pendientes) -->
          <div *ngIf="activeTab === 'pending'" style="display: flex; gap: 8px;">
            <button class="btn btn-success btn-sm" style="background: #4caf50; color: white;"
                    (click)="approveRequest(req)">
              ✅ Aprobar
            </button>
            <button class="btn btn-danger btn-sm" style="background: #dc3545; color: white;"
                    (click)="rejectRequest(req)">
              ❌ Rechazar
            </button>
          </div>

          <!-- Estado para aprobados/rechazados -->
          <div *ngIf="activeTab !== 'pending'">
            <span *ngIf="activeTab === 'approved'" class="badge badge-success" style="background: #4caf50; color: white; padding: 4px 8px;">
              ✅ Aprobado
            </span>
            <span *ngIf="activeTab === 'rejected'" class="badge badge-danger" style="background: #dc3545; color: white; padding: 4px 8px;">
              ❌ Rechazado
            </span>
          </div>
        </div>
      </div>
    </div>
  `
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
    this.http.post(`${this.apiUrl}/${req.id}/approve`, {}).subscribe({
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
    this.http.post(`${this.apiUrl}/${req.id}/reject`, { reason }).subscribe({
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
