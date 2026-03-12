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

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'ADMIN.CUSTOMERS_LIST' | translate }}</h1>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" [(ngModel)]="searchQuery"
               (ngModelChange)="onSearch($event)"
               [placeholder]="'ADMIN.SEARCH_PLACEHOLDER' | translate" />
      </div>

      <!-- Success alert -->
      <div *ngIf="success" class="alert alert-success fade-in">✅ {{ 'ADMIN.STAMP_ADDED' | translate }}</div>
      <div *ngIf="error" class="alert alert-error fade-in">⚠️ {{ error }}</div>

      <!-- Selected customer detail -->
      <div *ngIf="selectedCard" class="card fade-in" style="margin-bottom: 20px; border: 2px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1.1rem;">{{ selectedCard.customerName }}</h3>
            <div style="font-size: 0.85rem; color: var(--text-muted);">{{ selectedCard.customerEmail }}</div>
          </div>
          <button class="btn btn-outline btn-sm" (click)="selectedCard = null">{{ 'COMMON.CLOSE' | translate }}</button>
        </div>

        <div class="loyalty-card-visual" style="margin-bottom: 16px;">
          <div class="loyalty-card-business">{{ selectedCard.businessName }}</div>
          <div class="loyalty-card-name">{{ selectedCard.customerName }}</div>
          <div class="loyalty-card-reward">🏆 {{ selectedCard.rewardDescription }}</div>
          <div class="stamp-grid">
            <div *ngFor="let i of getStampArray(selectedCard)" class="stamp-cell"
                 [class.filled]="i < selectedCard.currentStamps" [class.empty]="i >= selectedCard.currentStamps">
              <span *ngIf="i < selectedCard.currentStamps">☕</span>
              <span *ngIf="i >= selectedCard.currentStamps" style="font-size:0.9rem;">{{ i+1 }}</span>
            </div>
          </div>
          <div class="progress-bar" style="margin-top: 16px;">
            <div class="progress-fill" [style.width.%]="getProgress(selectedCard)"></div>
          </div>
        </div>

        <!-- Add stamp -->
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" class="form-control" [(ngModel)]="stampNote" placeholder="Note (optional)" style="flex:1" />
          <button class="btn btn-primary" [disabled]="addingStamp" (click)="addStamp(selectedCard.userId)">
            <span *ngIf="!addingStamp">☕ Add Stamp</span>
            <span *ngIf="addingStamp">...</span>
          </button>
        </div>
      </div>

      <!-- Customer list -->
      <div *ngIf="loading" style="text-align:center; padding: 40px;"><div class="spinner"></div></div>

      <div *ngIf="!loading" class="customer-list">
        <div *ngFor="let customer of filteredCustomers" class="customer-card-item" style="margin-bottom: 10px; cursor: pointer;" (click)="viewCustomer(customer)">
          <div class="avatar">{{ customer.firstName[0] }}{{ customer.lastName[0] }}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600;">{{ customer.firstName }} {{ customer.lastName }}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">{{ customer.email }}</div>
            <div style="margin-top: 4px;">
              <div class="progress-bar" style="height: 6px; width: 120px;">
                <div class="progress-fill" [style.width.%]="(customer.currentStamps / customer.totalStamps) * 100"></div>
              </div>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary);">
              {{ customer.currentStamps }}/{{ customer.totalStamps }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">{{ customer.completedCards }} completed</div>
            <span class="badge" style="margin-top: 4px;"
                  [class.badge-success]="customer.cardStatus === 'ACTIVE'"
                  [class.badge-warning]="customer.cardStatus === 'REWARD_PENDING'">
              {{ customer.cardStatus }}
            </span>
          </div>
        </div>

        <div *ngIf="filteredCustomers.length === 0" style="text-align: center; padding: 40px; color: var(--text-muted);">
          {{ 'ADMIN.NO_CUSTOMERS' | translate }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-bar {
      position: relative;
      margin-bottom: 20px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
    }
    .search-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--primary); }
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
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length > 1) {
        this.loyaltyService.searchCustomers(q).subscribe(data => this.filteredCustomers = data);
      } else {
        this.filteredCustomers = this.customers;
      }
    });
  }

  ngOnInit() {
    this.loyaltyService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  viewCustomer(customer: Customer) {
    this.loyaltyService.getCustomerCard(customer.id).subscribe({
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
        // Refresh list
        this.loyaltyService.getAllCustomers().subscribe(data => {
          this.customers = data;
          this.filteredCustomers = data;
        });
        setTimeout(() => this.success = false, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add stamp';
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
