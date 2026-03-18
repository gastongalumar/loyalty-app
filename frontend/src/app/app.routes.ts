import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      {
        path: 'users',
        loadComponent: () => import('./pages/user-management/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'card',
        loadComponent: () => import('./pages/customer-card/customer-card.component').then(m => m.CustomerCardComponent)
      },
      {
        path: 'qr',
        loadComponent: () => import('./pages/qr-display/qr-display.component').then(m => m.QrDisplayComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      },
      { path: '', redirectTo: 'card', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'BUSINESS_OWNER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'scanner',
        loadComponent: () => import('./pages/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customer-search/customer-search.component').then(m => m.CustomerSearchComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/user-management/user-management.component')
          .then(m => m.UserManagementComponent)
      },
      {
        path: 'appearance',
        loadComponent: () => import('./pages/appearance/appearance.component').then(m => m.AppearanceComponent)
      },
      {
        path: 'fidelity-tiers',
        loadComponent: () => import('./pages/fidelity-tiers/fidelity-tiers.component').then(m => m.FidelityTiersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/business-settings/business-settings.component').then(m => m.BusinessSettingsComponent)
      },
      {
        path: 'redemptions',
        loadComponent: () => import('./pages/admin-redemptions/admin-redemptions.component').then(m => m.AdminRedemptionsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
