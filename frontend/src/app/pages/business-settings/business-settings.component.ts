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

interface BusinessSettings {
  id?: number;
  name: string;
  description: string;
  logoUrl: string;
  stampsRequired: number;
  rewardDescription: string;
  totalCustomers?: number;
}

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent, AlertComponent, LoadingComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 48px; max-width: 680px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" style="font-size: 0.875rem; color: var(--text-muted); text-decoration: none; display: inline-block; margin-bottom: 8px;">
          ← Back to Dashboard
        </a>
        <h1 class="page-title">Business Settings</h1>
        <p class="page-subtitle">Configure your loyalty program rules and branding.</p>
      </div>

      <app-loading *ngIf="loading"></app-loading>
      <app-alert [message]="successMsg" type="success" (dismissed)="successMsg = ''"></app-alert>
      <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg = ''"></app-alert>

      <div *ngIf="!loading && settings" class="fade-in">

        <!-- Info banner -->
        <div style="background: var(--primary-light); border: 1px solid rgba(255,107,53,0.2); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px; font-size: 0.875rem; color: var(--primary);">
          👥 <strong>{{ settings.totalCustomers }}</strong> customer(s) currently enrolled in your program.
        </div>

        <!-- Business details -->
        <div class="card" style="margin-bottom: 16px;">
          <h2 style="font-size: 1rem; margin-bottom: 16px; font-family: var(--font-display);">Business Info</h2>

          <div class="form-group">
            <label class="form-label">Business Name</label>
            <input type="text" class="form-control" [(ngModel)]="settings.name" />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" [(ngModel)]="settings.description" rows="3"
                      style="resize: vertical;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Logo URL (optional)</label>
            <input type="url" class="form-control" [(ngModel)]="settings.logoUrl"
                   placeholder="https://example.com/logo.png" />
          </div>
        </div>

        <!-- Loyalty rules -->
        <div class="card" style="margin-bottom: 24px;">
          <h2 style="font-size: 1rem; margin-bottom: 6px; font-family: var(--font-display);">Loyalty Rules</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            ⚠️ Changing stamps required affects all future cards, not existing progress.
          </p>

          <div class="form-group">
            <label class="form-label">Stamps Required for Reward</label>
            <input type="number" class="form-control" [(ngModel)]="settings.stampsRequired"
                   min="1" max="50" />
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
              Currently: collect {{ settings.stampsRequired }} stamps → earn 1 reward
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Reward Description</label>
            <input type="text" class="form-control" [(ngModel)]="settings.rewardDescription"
                   placeholder="e.g. Buy 10 coffees, get 1 FREE!" />
          </div>

          <!-- Live preview -->
          <div style="background: var(--secondary); border-radius: var(--radius-md); padding: 16px; margin-top: 12px;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">
              Preview
            </div>
            <div style="color: white; font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 8px;">
              {{ settings.name }}
            </div>
            <div style="background: rgba(255,209,102,0.15); border: 1px solid rgba(255,209,102,0.25); border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; color: #FFD166;">
              🏆 {{ settings.rewardDescription }}
            </div>
            <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
              <div *ngFor="let i of previewStamps" style="width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"
                   [style.background]="i < 3 ? 'var(--primary)' : 'rgba(255,255,255,0.08)'"
                   [style.border]="i >= 3 ? '1.5px dashed rgba(255,255,255,0.2)' : 'none'">
                {{ i < 3 ? '☕' : '' }}
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" [disabled]="saving" (click)="save()">
          <span *ngIf="!saving">💾 Save Settings</span>
          <span *ngIf="saving">Saving...</span>
        </button>
      </div>
    </div>
  `
})
export class BusinessSettingsComponent implements OnInit {
  settings: BusinessSettings | null = null;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';

  get previewStamps(): number[] {
    return Array.from({ length: Math.min(this.settings?.stampsRequired ?? 10, 10) }, (_, i) => i);
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<BusinessSettings>(`${environment.apiUrl}/admin/business`).subscribe({
      next: (data) => { this.settings = data; this.loading = false; },
      error: () => { this.errorMsg = 'Failed to load settings'; this.loading = false; }
    });
  }

  save() {
    if (!this.settings) return;
    this.saving = true;
    this.http.put<BusinessSettings>(`${environment.apiUrl}/admin/business`, this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.successMsg = 'Settings saved successfully!';
        this.saving = false;
      },
      error: () => {
        this.errorMsg = 'Failed to save settings';
        this.saving = false;
      }
    });
  }
}
