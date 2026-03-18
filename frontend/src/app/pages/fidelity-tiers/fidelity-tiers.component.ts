import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar.component';
import { AlertComponent } from '../../components/alert.component';
import { LoadingComponent } from '../../components/loading.component';
import { environment } from '../../../environments/environment';

interface FidelityTier {
  id?: number;
  cardsRequired: number;
  rewardDescription: string;
  isActive: boolean;
}

@Component({
  selector: 'app-fidelity-tiers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NavbarComponent,
    AlertComponent,
    LoadingComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 48px; max-width: 800px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" style="font-size:0.875rem; color:var(--text-muted); text-decoration:none; display:inline-block; margin-bottom:8px;">
          ← {{ 'common.back' | translate }}
        </a>
        <h1 class="page-title">🎯 Recompensas por fidelidad</h1>
        <p class="page-subtitle">Configurá recompensas especiales cuando los clientes acumulan tarjetas completadas.</p>
      </div>

      <app-loading *ngIf="loading"></app-loading>
      <app-alert [message]="successMsg" type="success" (dismissed)="successMsg = ''"></app-alert>
      <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg = ''"></app-alert>

      <!-- Formulario para nuevo tier -->
      <div class="card fade-in" style="margin-bottom: 24px;">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          ➕ Agregar nuevo nivel
        </h2>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Tarjetas completadas</label>
            <input type="number" class="form-control" [(ngModel)]="newTier.cardsRequired"
                   min="1" placeholder="Ej: 5">
          </div>
          <div class="form-group" style="flex: 2;">
            <label class="form-label">Recompensa</label>
            <input type="text" class="form-control" [(ngModel)]="newTier.rewardDescription"
                   placeholder="Ej: Café gratis">
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 20px; margin-top: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="isActive" [(ngModel)]="newTier.isActive"
                   style="width: 18px; height: 18px; cursor: pointer;">
            <label for="isActive" style="cursor: pointer;">Activo</label>
          </div>
          <button class="btn btn-primary" (click)="createTier()" [disabled]="!isValidTier()">
            Guardar nivel
          </button>
        </div>
      </div>

      <!-- Lista de tiers existentes -->
      <div class="card fade-in">
        <h2 style="font-size:1rem; margin-bottom:16px; font-family:var(--font-display);">
          📋 Niveles configurados
        </h2>

        <div *ngIf="tiers.length === 0" style="text-align: center; padding: 30px; color: var(--text-muted);">
          No hay niveles configurados aún.
        </div>

        <div *ngFor="let tier of tiers" class="tier-item">

          <!-- Fila superior: número + descripción + badge -->
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <div style="flex-shrink:0; width:52px; text-align:center;">
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); line-height:1;">
                {{ tier.cardsRequired }}
              </div>
              <div style="font-size:0.68rem; color:var(--text-muted);">tarjetas</div>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                {{ tier.rewardDescription }}
              </div>
              <span class="badge" [class.badge-success]="tier.isActive" [class.badge-secondary]="!tier.isActive">
                {{ tier.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <!-- Fila inferior: botones siempre visibles -->
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-outline btn-sm" style="flex:1;" (click)="toggleActive(tier)">
              {{ tier.isActive ? 'Desactivar' : 'Activar' }}
            </button>
            <button class="btn btn-danger btn-sm" (click)="deleteTier(tier)">🗑️</button>
          </div>
        </div>
      </div>

      <!-- Preview de cómo funciona -->
      <div class="card fade-in" style="margin-top: 24px; background: var(--primary-light);">
        <h3 style="font-size:0.9rem; margin-bottom:12px; color: var(--primary);">💡 Cómo funciona</h3>
        <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
          <li>Las recompensas se otorgan automáticamente cuando un cliente completa una tarjeta.</li>
          <li>Si el cliente llega a 5 tarjetas completadas, obtiene la recompensa de 5 (si está configurada).</li>
          <li>Las recompensas no se otorgan retroactivamente (solo a partir de ahora).</li>
          <li>Podés desactivar un nivel sin eliminarlo, para que no se otorgue más.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
 .tier-item {
 padding: 14px 0;
 border-bottom: 1px solid var(--border);
 display: flex;
 flex-direction: column;
 }
 .tier-item:last-child { border-bottom: none; }
 `]
})
export class FidelityTiersComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/admin/fidelity-tiers`;

  tiers: FidelityTier[] = [];
  loading = true;
  successMsg = '';
  errorMsg = '';

  newTier: FidelityTier = {
    cardsRequired: 5,
    rewardDescription: '',
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTiers();
  }

  loadTiers() {
    this.loading = true;
    this.http.get<FidelityTier[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.tiers = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al cargar niveles';
        this.loading = false;
      }
    });
  }

  isValidTier(): boolean {
    return this.newTier.cardsRequired > 0 &&
           this.newTier.rewardDescription.trim().length > 0;
  }

  createTier() {
    this.http.post<FidelityTier>(this.apiUrl, this.newTier).subscribe({
      next: (tier) => {
        this.tiers.push(tier);
        this.tiers.sort((a, b) => a.cardsRequired - b.cardsRequired);
        this.newTier = { cardsRequired: 5, rewardDescription: '', isActive: true };
        this.successMsg = 'Nivel creado correctamente';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al crear nivel';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  toggleActive(tier: FidelityTier) {
    const updated = { ...tier, isActive: !tier.isActive };
    this.http.put<FidelityTier>(`${this.apiUrl}/${tier.id}`, updated).subscribe({
      next: (updatedTier) => {
        tier.isActive = updatedTier.isActive;
        this.successMsg = `Nivel ${updatedTier.isActive ? 'activado' : 'desactivado'}`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al actualizar nivel';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  deleteTier(tier: FidelityTier) {
    if (!confirm('¿Eliminar el nivel de ' + tier.cardsRequired + ' tarjetas?')) return;

    this.http.delete(`${this.apiUrl}/${tier.id}`).subscribe({
      next: () => {
        this.tiers = this.tiers.filter(t => t.id !== tier.id);
        this.successMsg = 'Nivel eliminado';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Error al eliminar nivel';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}
