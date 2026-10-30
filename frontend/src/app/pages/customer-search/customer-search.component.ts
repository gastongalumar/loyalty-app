import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppDatePipe } from '../../pipes/app-date.pipe';
import { NavbarComponent } from '../../components/navbar.component';
import { LoyaltyService } from '../../services/loyalty.service';
import { SlugService } from '../../services/slug.service';
import { Customer } from '../../models/models';
import { cardStatusKey } from '../../utils/status';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AppDatePipe, NavbarComponent],
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.css']
})
export class CustomerSearchComponent implements OnInit {
  customers: Customer[] = [];
  query = '';
  loading = false;
  error = '';
  success = '';
  addingId = 0;
  total = 0;

  qrCustomer: Customer | null = null;
  qrValue = '';
  qrLoading = false;
  qrError = '';

  constructor(
    private loyalty: LoyaltyService,
    private translate: TranslateService,
    private slugService: SlugService
  ) {}

  get stampIcon(): string {
    return this.slugService.getTenant()?.stampIcon || '☕';
  }

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.loyalty.getCustomers(this.query).subscribe({
      next: (page) => {
        this.customers = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || this.translate.instant('ERRORS.LOAD_CUSTOMERS');
        this.loading = false;
      }
    });
  }

  clear(): void {
    this.query = '';
    this.search();
  }

  initials(customer: Customer): string {
    const first = customer.firstName?.trim().charAt(0) ?? '';
    const last = customer.lastName?.trim().charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  progress(customer: Customer): number {
    if (!customer.totalStamps) {
      return 0;
    }
    return Math.min((customer.currentStamps / customer.totalStamps) * 100, 100);
  }

  isReady(customer: Customer): boolean {
    return customer.cardStatus === 'REWARD_PENDING';
  }

  statusKey(customer: Customer): string {
    return cardStatusKey(customer.cardStatus);
  }

  addStamp(customer: Customer): void {
    this.error = '';
    this.addingId = customer.id;
    this.loyalty.addStamp({ userId: customer.id }).subscribe({
      next: (card) => {
        customer.currentStamps = card.currentStamps;
        customer.totalStamps = card.totalStamps;
        customer.cardStatus = card.status;
        customer.completedCards = card.completedCards;
        this.addingId = 0;
        this.success = `${customer.firstName}: ${card.currentStamps}/${card.totalStamps} · ${this.translate.instant('BUSINESS.STAMP_ADDED')}`;
        setTimeout(() => this.success = '', 2500);
      },
      error: (err) => {
        this.addingId = 0;
        this.error = err.error?.message || this.translate.instant('ERRORS.ADD_STAMP');
      }
    });
  }

  openQr(customer: Customer): void {
    this.qrCustomer = customer;
    this.qrValue = '';
    this.qrError = '';
    this.qrLoading = true;

    this.loyalty.getCustomerQr(customer.id).subscribe({
      next: (response) => {
        this.qrValue = response.qrCode;
        this.qrLoading = false;
      },
      error: (err) => {
        this.qrError = err.error?.message || this.translate.instant('ERRORS.LOAD_QR');
        this.qrLoading = false;
      }
    });
  }

  closeQr(): void {
    this.qrCustomer = null;
    this.qrValue = '';
    this.qrError = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.qrCustomer) {
      this.closeQr();
    }
  }
}
