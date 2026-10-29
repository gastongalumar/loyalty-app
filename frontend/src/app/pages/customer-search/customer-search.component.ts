import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 40px;">
      <div class="page-header">
        <h1 class="page-title">{{ 'BUSINESS.SEARCH_TITLE' | translate }}</h1>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <input class="form-control" [(ngModel)]="query"
               [placeholder]="'BUSINESS.SEARCH_PLACEHOLDER' | translate"
               (keydown.enter)="search()" />
        <button class="btn btn-primary" (click)="search()">{{ 'COMMON.SEARCH' | translate }}</button>
      </div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <div class="card" *ngIf="customers.length === 0 && !loading">
        {{ 'COMMON.NONE' | translate }}
      </div>

      <div class="card" *ngFor="let customer of customers" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <strong>{{ customer.firstName }} {{ customer.lastName }}</strong>
            <div style="color: var(--color-text-muted); font-size: 0.9rem;">{{ customer.email }}</div>
          </div>
          <div>{{ customer.currentStamps }} / {{ customer.totalStamps }} · {{ customer.cardStatus }}</div>
          <button class="btn btn-primary btn-sm" (click)="addStamp(customer)">
            {{ 'BUSINESS.ADD_STAMP' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerSearchComponent implements OnInit {
  customers: Customer[] = [];
  query = '';
  loading = false;
  error = '';
  success = '';

  constructor(private loyalty: LoyaltyService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.loyalty.getCustomers(this.query).subscribe({
      next: (page) => {
        this.customers = page.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Could not load customers';
        this.loading = false;
      }
    });
  }

  addStamp(customer: Customer): void {
    this.error = '';
    this.loyalty.addStamp({ userId: customer.id }).subscribe({
      next: (card) => {
        customer.currentStamps = card.currentStamps;
        customer.totalStamps = card.totalStamps;
        customer.cardStatus = card.status;
        this.success = 'Stamp added';
        setTimeout(() => this.success = '', 2500);
      },
      error: (err) => this.error = err.error?.message || 'Could not add stamp'
    });
  }
}
