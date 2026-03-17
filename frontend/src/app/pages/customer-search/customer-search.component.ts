import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { Customer, LoyaltyCard } from '../../models/models';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="page-wrapper">
      <div class="container" style="padding-top: 24px; padding-bottom: 40px;">

        <div class="page-header">
          <h1 class="page-title">{{ 'admin.customersList' | translate }}</h1>
          <p class="page-subtitle">{{ filteredCustomers.length }} {{ 'admin.registered' | translate }}</p>
        </div>

        <!-- Search -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input"
                 [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearch($event)"
                 [placeholder]="'admin.searchPlaceholder' | translate" />
        </div>

        <!-- Alerts -->
        <div *ngIf="success" class="alert alert-success fade-in">
          ✅ {{ 'admin.stampAdded' | translate }}
        </div>
        <div *ngIf="error" class="alert alert-error fade-in">⚠️ {{ error }}</div>

        <!-- Selected customer detail -->
        <div *ngIf="selectedCard" class="card fade-in selected-card">
          <div class="selected-header">
            <div>
              <div class="selected-name">{{ selectedCard.customerName }}</div>
              <div class="selected-email">{{ selectedCard.customerEmail }}</div>
            </div>
            <button class="btn btn-outline btn-sm" (click)="selectedCard = null">✕</button>
          </div>

          <div class="loyalty-card-visual" style="margin-bottom: 16px;">
            <div class="loyalty-card-business">{{ selectedCard.businessName }}</div>
            <div class="loyalty-card-name">{{ selectedCard.customerName }}</div>
            <div class="loyalty-card-reward">🏆 {{ selectedCard.rewardDescription }}</div>
            <div class="stamp-grid">
              <div *ngFor="let i of getStampArray(selectedCard)"
                   class="stamp-cell"
                   [class.filled]="i < selectedCard.currentStamps"
                   [class.empty]="i >= selectedCard.currentStamps">
                <span *ngIf="i < selectedCard.currentStamps">☕</span>
                <span *ngIf="i >= selectedCard.currentStamps" class="stamp-num">{{ i+1 }}</span>
              </div>
            </div>
            <div class="progress-bar" style="margin-top:16px;">
              <div class="progress-fill" [style.width.%]="getProgress(selectedCard)"></div>
            </div>
          </div>

          <div class="stamp-action-row">
            <input type="text" class="form-control" [(ngModel)]="stampNote"
                   placeholder="Nota (opcional)" style="flex:1" />
            <button class="btn btn-primary" [disabled]="addingStamp"
                    (click)="addStamp(selectedCard.userId)">
              <span *ngIf="!addingStamp">☕ {{ 'admin.addStamp' | translate }}</span>
              <span *ngIf="addingStamp" class="spinner"
                    style="width:18px;height:18px;border-width:2px;margin:0;"></span>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" style="text-align:center; padding:40px;">
          <div class="spinner"></div>
        </div>

        <!-- Customer list -->
        <div *ngIf="!loading" class="customer-list-wrap">
          <div *ngFor="let c of filteredCustomers"
               class="cust-item"
               (click)="viewCustomer(c)">
            <div class="avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>

            <div class="cust-info">
              <div class="cust-name">{{ c.firstName }} {{ c.lastName }}</div>
              <div class="cust-email">{{ c.email }}</div>
              <div class="cust-progress-wrap">
                <div class="cust-progress-track">
                  <div class="cust-progress-fill"
                       [style.width.%]="((c.currentStamps ?? 0) / (c.totalStamps ?? 1)) * 100">
                  </div>
                </div>
                <span class="cust-stamps">{{ c.currentStamps }}/{{ c.totalStamps }}</span>
              </div>
            </div>

            <div class="cust-right">
              <span class="badge"
                    [class.badge-success]="c.cardStatus === 'ACTIVE'"
                    [class.badge-warning]="c.cardStatus === 'REWARD_PENDING'">
                {{ c.cardStatus }}
              </span>
              <div class="cust-completed">{{ c.completedCards }} completadas</div>
            </div>
          </div>

          <div *ngIf="filteredCustomers.length === 0" class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">{{ 'admin.noCustomers' | translate }}</div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .selected-card  { margin-bottom: 20px; border: 2px solid var(--primary); }
    .selected-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .selected-name  { font-weight: 700; font-size: 1rem; }
    .selected-email { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
    .stamp-action-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    /* Customer list */
    .customer-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cust-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      cursor: pointer;
      transition: all 0.18s;
      box-shadow: var(--shadow-xs);
    }
    .cust-item:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .cust-info { flex: 1; min-width: 0; }
    .cust-name {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cust-email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 6px;
    }
    .cust-progress-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cust-progress-track {
      flex: 1;
      height: 5px;
      background: var(--border);
      border-radius: 999px;
      overflow: hidden;
      max-width: 100px;
    }
    .cust-progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 999px;
      transition: width 0.5s ease;
    }
    .cust-stamps {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--primary);
      white-space: nowrap;
    }
    .cust-right {
      text-align: right;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .cust-completed {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
  `]
})
export class CustomerSearchComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCard: LoyaltyCard | null = null;
  loading = true;
  searchQuery = '';
  stampNote = '';
  addingStamp = false;
  success = false;
  error = '';
  private searchSubject = new Subject<string>();

  constructor(private loyaltyService: LoyaltyService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q.length > 1) {
        this.loyaltyService.searchCustomers(q).subscribe(
          data => this.filteredCustomers = data
        );
      } else {
        this.filteredCustomers = this.customers;
      }
    });
  }

  ngOnInit() {
    this.loyaltyService.getAllCustomers().subscribe({
      next: (data) => { this.customers = data; this.filteredCustomers = data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onSearch(q: string) { this.searchSubject.next(q); }

  viewCustomer(c: Customer) {
    this.loyaltyService.getCustomerCard(c.id).subscribe({
      next: (card) => { this.selectedCard = card; }
    });
  }

  addStamp(userId: number) {
    this.addingStamp = true;
    this.error = '';
    this.loyaltyService.addStamp({ userId, note: this.stampNote }).subscribe({
      next: (card) => {
        this.selectedCard = card;
        this.success = true;
        this.addingStamp = false;
        this.stampNote = '';
        this.loyaltyService.getAllCustomers().subscribe(data => {
          this.customers = data;
          this.filteredCustomers = data;
        });
        setTimeout(() => this.success = false, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al agregar stamp';
        this.addingStamp = false;
      }
    });
  }

  getStampArray(card: LoyaltyCard): number[] {
    return Array.from({ length: card.totalStamps }, (_, i) => i);
  }

  getProgress(card: LoyaltyCard): number {
    return (card.currentStamps / card.totalStamps) * 100;
  }
}
