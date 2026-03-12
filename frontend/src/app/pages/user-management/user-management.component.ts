import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar.component';
import { environment } from '../../../environments/environment';

interface ManagedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container-wide" style="padding-top: 24px; padding-bottom: 48px;">
      <div class="page-header">
        <a routerLink="/admin/dashboard" style="font-size:0.875rem; color:var(--text-muted); text-decoration:none; display:inline-block; margin-bottom:8px;">
          ← Volver al panel
        </a>
        <h1 class="page-title">Gestión de usuarios</h1>
        <p class="page-subtitle">Creá, eliminá y modificá el rol de cualquier usuario.</p>
      </div>

      <!-- ALERTS -->
      <div *ngIf="success" class="alert alert-success fade-in">✅ {{ success }}</div>
      <div *ngIf="error" class="alert alert-error fade-in">⚠️ {{ error }}</div>

      <!-- CREATE USER PANEL -->
      <div class="card fade-in" style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 style="font-size:1rem; font-family:var(--font-display);">➕ Crear nuevo usuario</h2>
          <button class="btn btn-outline btn-sm" (click)="showForm = !showForm">
            {{ showForm ? 'Cancelar' : 'Nuevo usuario' }}
          </button>
        </div>

        <div *ngIf="showForm" class="fade-in">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" [(ngModel)]="newUser.firstName" placeholder="Nombre" />
            </div>
            <div class="form-group">
              <label class="form-label">Apellido</label>
              <input type="text" class="form-control" [(ngModel)]="newUser.lastName" placeholder="Apellido" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="newUser.email" placeholder="email@ejemplo.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono (opcional)</label>
            <input type="tel" class="form-control" [(ngModel)]="newUser.phone" placeholder="+54 11 ..." />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" [(ngModel)]="newUser.password" placeholder="Mínimo 6 caracteres" />
          </div>

          <div class="form-group">
            <label class="form-label">Rol</label>
            <select class="form-control" [(ngModel)]="newUser.role">
              <option value="CUSTOMER">Cliente</option>
              <option value="BUSINESS_OWNER">Administrador</option>
            </select>
          </div>

          <button class="btn btn-primary" [disabled]="creating" (click)="createUser()">
            <span *ngIf="!creating">Crear usuario</span>
            <span *ngIf="creating">Creando...</span>
          </button>
        </div>
      </div>

      <!-- USER LIST -->
      <div class="card fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h2 style="font-size:1rem; font-family:var(--font-display);">👥 Todos los usuarios</h2>
          <span style="font-size:0.85rem; color:var(--text-muted);">{{ users.length }} en total</span>
        </div>

        <!-- Filter -->
        <div class="search-bar" style="margin-bottom:16px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" [(ngModel)]="filterQuery"
                 placeholder="Buscar por nombre o email..." />
        </div>

        <div *ngIf="loading" style="text-align:center; padding:20px;">
          <div class="spinner"></div>
        </div>

        <div *ngIf="!loading">
          <!-- Table header -->
          <div style="display:grid; grid-template-columns:1fr 1fr 140px 120px; gap:8px; padding:8px 12px;
                      font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;
                      letter-spacing:0.5px; border-bottom:1px solid var(--border); margin-bottom:8px;">
            <span>Usuario</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Acciones</span>
          </div>

          <div *ngFor="let user of filteredUsers" class="user-row fade-in">
            <div style="display:grid; grid-template-columns:1fr 1fr 140px 120px; gap:8px; align-items:center;
                        padding:12px; border-radius:var(--radius-md); transition:background 0.15s;">

              <!-- Name -->
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</div>
                <div>
                  <div style="font-weight:600; font-size:0.9rem;">{{ user.firstName }} {{ user.lastName }}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">Desde {{ user.createdAt | date:'dd/MM/yyyy' }}</div>
                </div>
              </div>

              <!-- Email -->
              <div style="font-size:0.875rem; color:var(--text-secondary);">{{ user.email }}</div>

              <!-- Role -->
              <div>
                <select class="form-control" style="font-size:0.8rem; padding:6px 10px;"
                        [ngModel]="user.role"
                        (ngModelChange)="changeRole(user, $event)">
                  <option value="CUSTOMER">Cliente</option>
                  <option value="BUSINESS_OWNER">Admin</option>
                </select>
              </div>

              <!-- Delete -->
              <div>
                <button class="btn btn-danger btn-sm" (click)="confirmDelete(user)"
                        [disabled]="deletingId === user.id">
                  {{ deletingId === user.id ? '...' : '🗑 Eliminar' }}
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredUsers.length === 0" style="text-align:center; padding:30px; color:var(--text-muted);">
            No hay usuarios que coincidan.
          </div>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE MODAL -->
    <div *ngIf="userToDelete" class="modal-overlay fade-in" (click)="userToDelete = null">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3 style="font-family:var(--font-display); margin-bottom:10px;">¿Eliminar usuario?</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px; font-size:0.9rem;">
          Vas a eliminar a <strong>{{ userToDelete.firstName }} {{ userToDelete.lastName }}</strong>
          ({{ userToDelete.email }}). Esta acción no se puede deshacer.
        </p>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-danger" style="flex:1" (click)="deleteUser()">Sí, eliminar</button>
          <button class="btn btn-outline" (click)="userToDelete = null">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-row:hover > div { background: var(--surface-2); }
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 999; padding: 16px;
    }
    .modal-box {
      background: var(--surface);
      border-radius: var(--radius-xl);
      padding: 32px;
      max-width: 420px;
      width: 100%;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border);
    }
    @media (max-width: 640px) {
      .user-row > div { grid-template-columns: 1fr 120px !important; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private readonly API = `${environment.apiUrl}/admin/users`;

  users: ManagedUser[] = [];
  loading = true;
  creating = false;
  deletingId: number | null = null;
  showForm = false;
  filterQuery = '';
  success = '';
  error = '';
  userToDelete: ManagedUser | null = null;

  newUser: CreateUserForm = {
    firstName: '', lastName: '', email: '',
    phone: '', password: '', role: 'CUSTOMER'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  get filteredUsers(): ManagedUser[] {
    const q = this.filterQuery.toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  loadUsers() {
    this.loading = true;
    this.http.get<ManagedUser[]>(this.API).subscribe({
      next: (users) => { this.users = users; this.loading = false; },
      error: () => { this.error = 'Error cargando usuarios'; this.loading = false; }
    });
  }

  createUser() {
    if (!this.newUser.firstName || !this.newUser.email || !this.newUser.password) {
      this.error = 'Completá todos los campos obligatorios';
      return;
    }
    this.creating = true;
    this.http.post<ManagedUser>(this.API, this.newUser).subscribe({
      next: (user) => {
        this.users.unshift(user);
        this.showForm = false;
        this.newUser = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'CUSTOMER' };
        this.showSuccess('Usuario creado correctamente');
        this.creating = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al crear el usuario';
        this.creating = false;
      }
    });
  }

  changeRole(user: ManagedUser, newRole: string) {
    this.http.patch<ManagedUser>(`${this.API}/${user.id}/role`, { role: newRole }).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.showSuccess(`Rol actualizado a ${newRole === 'BUSINESS_OWNER' ? 'Admin' : 'Cliente'}`);
      },
      error: () => { this.error = 'Error al cambiar el rol'; }
    });
  }

  confirmDelete(user: ManagedUser) {
    this.userToDelete = user;
  }

  deleteUser() {
    if (!this.userToDelete) return;
    this.deletingId = this.userToDelete.id;
    this.http.delete(`${this.API}/${this.userToDelete.id}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.showSuccess('Usuario eliminado');
        this.userToDelete = null;
        this.deletingId = null;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al eliminar';
        this.userToDelete = null;
        this.deletingId = null;
      }
    });
  }

  private showSuccess(msg: string) {
    this.success = msg;
    this.error = '';
    setTimeout(() => this.success = '', 3500);
  }
}
