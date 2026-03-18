import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar.component';
import { AlertComponent } from '../../components/alert.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

interface ProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent,
    AlertComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-wrapper">
      <div class="container" style="padding-top:24px; padding-bottom:80px;">
        <div class="page-header">
          <a routerLink="/customer/card" class="page-back">← Volver</a>
          <h1 class="page-title">👤 Mi Perfil</h1>
        </div>

        <app-alert [message]="successMsg" type="success" (dismissed)="successMsg=''"></app-alert>
        <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg=''"></app-alert>

        <!-- Avatar -->
        <div class="card" style="text-align:center; padding:24px; margin-bottom:16px;">
          <div style="position:relative; display:inline-block;">
            <img *ngIf="avatarUrl" [src]="getImageUrl(avatarUrl)" alt="Avatar"
                 style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);">
            <div *ngIf="!avatarUrl"
                 style="width:96px;height:96px;border-radius:50%;background:var(--primary-light); display:flex;align-items:center;justify-content:center;font-size:2.2rem; font-weight:700;color:var(--primary);">
              {{ initials }}
            </div>
            <label style="position:absolute;bottom:0;right:0;background:var(--primary);color:white; border-radius:50%;width:28px;height:28px;display:flex;align-items:center; justify-content:center;cursor:pointer;font-size:0.85rem;">
              📷
              <input type="file" accept="image/*" style="display:none" (change)="onAvatarChange($event)">
            </label>
          </div>

          <div style="margin-top:10px;font-weight:700;font-size:1.1rem;">{{ form.firstName }} {{ form.lastName }}</div>
          <div style="color:var(--text-muted);font-size:0.85rem;">{{ form.email }}</div>
        </div>

        <!-- Datos personales -->
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h2 style="font-size:1rem;margin-bottom:16px;font-family:var(--font-display);">Datos personales</h2>
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="form-control" [(ngModel)]="form.firstName" placeholder="Nombre">
          </div>
          <div class="form-group">
            <label class="form-label">Apellido</label>
            <input class="form-control" [(ngModel)]="form.lastName" placeholder="Apellido">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" [(ngModel)]="form.email" placeholder="Email">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input class="form-control" [(ngModel)]="form.phone" placeholder="Teléfono">
          </div>
          <button class="btn btn-primary btn-full" [disabled]="saving" (click)="saveProfile()">
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

        <!-- Cambiar contraseña -->
        <div class="card" style="padding:20px;">
          <h2 style="font-size:1rem;margin-bottom:16px;font-family:var(--font-display);">Cambiar contraseña</h2>
          <div class="form-group">
            <label class="form-label">Contraseña actual</label>
            <input class="form-control" type="password" [(ngModel)]="pwd.current" placeholder="Contraseña actual">
          </div>
          <div class="form-group">
            <label class="form-label">Nueva contraseña</label>
            <input class="form-control" type="password" [(ngModel)]="pwd.newPwd" placeholder="Nueva contraseña (min 6 caracteres)">
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar nueva contraseña</label>
            <input class="form-control" type="password" [(ngModel)]="pwd.confirm" placeholder="Repetir contraseña">
          </div>
          <button class="btn btn-outline btn-full" [disabled]="savingPwd" (click)="changePassword()">
            {{ savingPwd ? 'Cambiando...' : 'Cambiar contraseña' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerProfileComponent implements OnInit {
  form: ProfileResponse = { firstName: '', lastName: '', email: '', phone: '', avatarUrl: '' };
  pwd = { current: '', newPwd: '', confirm: '' };
  avatarUrl = '';
  saving = false;
  savingPwd = false;
  successMsg = '';
  errorMsg = '';

  get initials() {
    return (this.form.firstName?.[0] || '') + (this.form.lastName?.[0] || '');
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

  getImageUrl(path: string): string {
    return this.themeService.getImageUrl(path);
  }

  ngOnInit() {
    // Cargar datos desde el backend para tener la info más fresca
    this.http.get<ProfileResponse>(`${environment.apiUrl}/customer/profile`).subscribe({
      next: (data) => {
        this.form = data;
        this.avatarUrl = data.avatarUrl || '';
      },
      error: () => {
        // Fallback: usar datos del localStorage si el endpoint no existe aún
        const user = this.authService.getUser();
        if (user) {
          this.form = { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: '', avatarUrl: '' } as ProfileResponse;
        }
      }
    });
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ url: string }>(`${environment.apiUrl}/customer/avatar`, formData).subscribe({
      next: (res) => { this.avatarUrl = res.url; this.successMsg = '📷 Foto actualizada'; },
      error: () => { this.errorMsg = 'Error al subir la foto'; }
    });
  }

  saveProfile() {
    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.email.trim()) {
      this.errorMsg = 'Nombre, apellido y email son obligatorios';
      return;
    }
    this.saving = true;
    this.http.put<ProfileResponse>(`${environment.apiUrl}/customer/profile`, {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone
    }).subscribe({
      next: (updated) => {
        this.successMsg = '✅ Perfil actualizado';
        this.saving = false;
        // Actualizar localStorage para que navbar muestre nombre correcto
        const user = this.authService.getUser();
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            ...user, firstName: updated.firstName, lastName: updated.lastName, email: updated.email
          }));
        }
      },
      error: (e) => { this.errorMsg = e.error?.error || 'Error al guardar'; this.saving = false; }
    });
  }

  changePassword() {
    if (!this.pwd.current) { this.errorMsg = 'Ingresá tu contraseña actual'; return; }
    if (this.pwd.newPwd.length < 6) { this.errorMsg = 'La nueva contraseña debe tener al menos 6 caracteres'; return; }
    if (this.pwd.newPwd !== this.pwd.confirm) { this.errorMsg = 'Las contraseñas no coinciden'; return; }
    this.savingPwd = true;
    this.http.put(`${environment.apiUrl}/customer/change-password`, {
      currentPassword: this.pwd.current,
      newPassword: this.pwd.newPwd
    }).subscribe({
      next: () => {
        this.successMsg = '🔐 Contraseña cambiada correctamente';
        this.savingPwd = false;
        this.pwd = { current: '', newPwd: '', confirm: '' };
      },
      error: (e) => {
        this.errorMsg = e.error?.error || 'Contraseña actual incorrecta';
        this.savingPwd = false;
      }
    });
  }
}
