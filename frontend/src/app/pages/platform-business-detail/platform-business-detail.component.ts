import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from '../../components/navbar.component';
import { PlatformService } from '../../services/platform.service';
import { Admin, Business } from '../../models/models';

@Component({
  selector: 'app-platform-business-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <a routerLink="/platform/businesses" class="btn btn-ghost btn-sm">{{ 'COMMON.BACK' | translate }}</a>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="success" class="alert alert-success">{{ success }}</div>

      <ng-container *ngIf="business">
        <div class="page-header">
          <h1 class="page-title">{{ business.name }}</h1>
          <p class="page-subtitle">{{ business.slug }} · {{ business.status }}</p>
        </div>

        <div class="card">
          <p>{{ business.description }}</p>
          <p><strong>{{ 'BUSINESS.REWARD' | translate }}:</strong> {{ business.rewardDescription }}</p>
          <p><strong>{{ 'BUSINESS.TOTAL_CUSTOMERS' | translate }}:</strong> {{ business.totalCustomers }}</p>
        </div>

        <div class="card" style="margin-top:16px;">
          <h3>{{ 'PLATFORM.ADMINS' | translate }}</h3>
          <ul>
            <li *ngFor="let admin of admins">{{ admin.email }} — {{ admin.firstName }} {{ admin.lastName }}</li>
          </ul>
          <p *ngIf="admins.length === 0">{{ 'COMMON.NONE' | translate }}</p>
        </div>

        <div class="card" style="margin-top:16px;">
          <h3>{{ 'PLATFORM.NEW_ADMIN' | translate }}</h3>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.EMAIL' | translate }}</label>
            <input class="form-control" [(ngModel)]="adminForm.email" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" class="form-control" [(ngModel)]="adminForm.password" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ 'AUTH.FIRST_NAME' | translate }}</label>
              <input class="form-control" [(ngModel)]="adminForm.firstName" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'AUTH.LAST_NAME' | translate }}</label>
              <input class="form-control" [(ngModel)]="adminForm.lastName" />
            </div>
          </div>
          <button class="btn btn-primary" [disabled]="creatingAdmin" (click)="createAdmin()">
            {{ creatingAdmin ? ('COMMON.LOADING' | translate) : ('COMMON.CREATE' | translate) }}
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  `]
})
export class PlatformBusinessDetailComponent implements OnInit {
  business: Business | null = null;
  admins: Admin[] = [];
  adminForm = { email: '', password: '', firstName: '', lastName: '' };
  creatingAdmin = false;
  error = '';
  success = '';
  private id = 0;

  constructor(private route: ActivatedRoute, private platform: PlatformService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.platform.get(this.id).subscribe({
      next: (business) => this.business = business,
      error: (err) => this.error = err.error?.message || 'Could not load business'
    });
    this.platform.listAdmins(this.id).subscribe({
      next: (admins) => this.admins = admins,
      error: () => this.admins = []
    });
  }

  createAdmin(): void {
    this.creatingAdmin = true;
    this.error = '';
    this.success = '';
    this.platform.createAdmin(this.id, this.adminForm).subscribe({
      next: (admin) => {
        this.creatingAdmin = false;
        this.success = `${admin.email} created`;
        this.adminForm = { email: '', password: '', firstName: '', lastName: '' };
        this.load();
      },
      error: (err) => {
        this.creatingAdmin = false;
        this.error = err.error?.message || 'Could not create admin';
      }
    });
  }
}
