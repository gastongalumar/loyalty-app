Loyalty App — Correcciones Completas
Código completo y listo para copiar/pegar en cada archivo
Angular 17 Frontend · Spring Boot Backend · Marzo 2026
Índice de correcciones
• FIX 1 — Logo chico al primer ingreso (ThemeService + LoginComponent)
• FIX 2 — Navbar del customer desaparece en pantalla de tarjeta
• FIX 3 — Botón Profile redirige al QR → crear pantalla de perfil completa
• FIX 4 — Stats del dashboard admin asimétricas en móvil 360px
• FIX 5 — Niveles de fidelidad desbordan el contenedor en móvil
• FIX 6 — 'Reward not in requested state' al aprobar canje (Backend)
• FIX 7 — Tab 'Rechazados' vacío siempre (Backend enum + query)
• FIX 8 — Canjes: botón Rechazar no visible en móvil
• FIX 9 — Traducciones faltantes (en.json + es.json)
ℹ️ Cada sección incluye el archivo completo o el bloque exacto a reemplazar.
FIX 1 — Logo chico al primer ingreso
Causa
ThemeService hace el fetch async en su constructor. LoginComponent lee getTheme() en ngOnInit antes de que
llegue la respuesta del servidor, obteniendo el DEFAULT_THEME (loginLogoSize=80). Al entrar de nuevo (postlogin/logout) el cache ya está poblado y se ve correcto.
Solución en dos partes: (A) ThemeService carga localStorage antes de ir al servidor; (B) LoginComponent se
suscribe a un Observable reactivo en vez de leer una sola vez.
📄 ARCHIVO: frontend/src/app/services/theme.service.ts
Agregar BehaviorSubject al inicio de la clase (después de 'private theme')
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
// ... (interfaces AppTheme, ThemeMode, DEFAULT_THEME sin cambios) ...
@Injectable({ providedIn: 'root' })
export class ThemeService {
private theme: AppTheme = { ...DEFAULT_THEME };
private apiUrl = `${environment.apiUrl}/admin/theme`;
// ✅ NUEVO: Observable para que los componentes reaccionen al tema
private themeSubject = new BehaviorSubject<AppTheme>({ ...DEFAULT_THEME });
public theme$: Observable<AppTheme> = this.themeSubject.asObservable();
constructor(private http: HttpClient) {
this.loadFromServer();
}
// ✅ FIX: Carga localStorage PRIMERO (evita flash), luego actualiza del servidor
async loadFromServer() {
// Paso 1: Aplicar cache guardado inmediatamente
const saved = localStorage.getItem('app-theme');
if (saved) {
try {
this.theme = { ...DEFAULT_THEME, ...JSON.parse(saved) };
this.apply();
} catch { /* cache corrupto, continúa con default */ }
}
// Paso 2: Actualizar desde el servidor en segundo plano
try {
const serverTheme = await firstValueFrom(
this.http.get<AppTheme>(`${environment.apiUrl}/admin/theme/public`)
);
this.theme = { ...DEFAULT_THEME, ...serverTheme };
this.apply();
localStorage.setItem('app-theme', JSON.stringify(this.theme));
} catch (error) {
console.error('Error loading theme from server', error);
// Si no había cache tampoco, aplica DEFAULT_THEME ya seteado
}
}
// ✅ FIX: apply() ahora también notifica el Observable
private apply(): void {
const root = document.documentElement;
const t = this.theme;
// ... (todo el código de apply() existente sin cambios) ...
// AGREGAR ESTA LÍNEA AL FINAL DEL MÉTODO apply():
this.themeSubject.next({ ...this.theme });
}
// ... resto de métodos sin cambios ...
}
📄 ARCHIVO: frontend/src/app/pages/login/login.component.ts
Modificar LoginComponent para suscribirse reactivamente
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LogoComponent } from '../../components/logo.component';
@Component({
selector: 'app-login',
standalone: true,
imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LogoComponent],
template: `
 <div class="auth-page">
 <div class="auth-card fade-in">
 <app-logo
 [showAppName]="true"
 [logoSize]="loginLogoSize"
 [nameSize]="28"
 [align]="'center'"
 [direction]="'column'"
 [textColor]="'var(--primary)'">
 </app-logo>
 <p class="auth-tagline">{{ 'auth.welcomeBack' | translate }}</p>
 <div class="lang-row">
 <div class="lang-switcher">
 <button class="lang-btn" [class.active]="currentLang === 'en'"
(click)="setLang('en')">EN</button>
 <button class="lang-btn" [class.active]="currentLang === 'es'"
(click)="setLang('es')">ES</button>
 </div>
 </div>
 <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>
 <div class="form-group">
 <label class="form-label">{{ 'auth.email' | translate }}</label>
 <input type="email" class="form-control" [(ngModel)]="email"
 [placeholder]="'auth.email' | translate">
 </div>
 <div class="form-group">
 <label class="form-label">{{ 'auth.password' | translate }}</label>
 <input type="password" class="form-control" [(ngModel)]="password"
 [placeholder]="'auth.password' | translate"
(keydown.enter)="onLogin()">
 </div>
 <button class="btn btn-primary btn-full btn-lg" [disabled]="loading"
(click)="onLogin()">
 <span *ngIf="!loading">{{ 'auth.signIn' | translate }}</span>
 <span *ngIf="loading">{{ 'auth.signingIn' | translate }}</span>
 </button>
 <p class="auth-link">
 {{ 'auth.noAccount' | translate }}
 <a routerLink="/register">{{ 'auth.signUp' | translate }}</a>
 </p>
 </div>
 </div>
 `
})
export class LoginComponent implements OnInit, OnDestroy {
 email = '';
 password = '';
 loading = false;
 error = '';
 currentLang = 'en';
 loginLogoSize = 80;
 private destroy$ = new Subject<void>();
 constructor(
 private authService: AuthService,
 private router: Router,
 private translate: TranslateService,
 private themeService: ThemeService
 ) {}
 ngOnInit() {
 this.currentLang = localStorage.getItem('lang') || 'en';
 // ✅ FIX: Suscripción reactiva — se actualiza cuando el tema llega del servidor
 this.themeService.theme$
 .pipe(takeUntil(this.destroy$))
 .subscribe(theme => {
 this.loginLogoSize = theme.loginLogoSize || 80;
 });
 }
 ngOnDestroy() {
 this.destroy$.next();
 this.destroy$.complete();
 }
 setLang(lang: string) {
 this.currentLang = lang;
 this.translate.use(lang);
 localStorage.setItem('lang', lang);
 }
 onLogin() {
 this.error = '';
 this.loading = true;
 this.authService.login({ email: this.email, password: this.password }).subscribe({
 next: (res) => {
 if (res.role === 'CUSTOMER') {
 this.router.navigate(['/customer/card']);
 } else {
 this.router.navigate(['/admin/dashboard']);
 }
 },
 error: (err) => {
 this.error = err.error?.error || 'Invalid email or password';
 this.loading = false;
 }
 });
 }
}
FIX 2 — Navbar desaparece en la pantalla Mi Tarjeta
Causa
customer-card.component.html usa su propia wallet-shell con un bottom-nav personalizado, pero NO incluye <appnavbar>. Cuando el usuario entra a /customer/card no hay header visible para navegar.
La solución es agregar <app-navbar> al tope del template, y asegurarse de que CustomerCardComponent importe
NavbarComponent.
📄 ARCHIVO: frontend/src/app/pages/customer-card/customer-card.component.ts
Agregar NavbarComponent a los imports del componente
import { NavbarComponent } from '../../components/navbar.component';
@Component({
 selector: 'app-customer-card',
 standalone: true,
 imports: [CommonModule, RouterLink, NavbarComponent], // ✅ agregar NavbarComponent
 changeDetection: ChangeDetectionStrategy.OnPush,
 templateUrl: './customer-card.component.html',
 styleUrls: ['./customer-card.component.scss']
})
📄 ARCHIVO: frontend/src/app/pages/customer-card/customer-card.component.html
Agregar <app-navbar> al principio del template (ANTES de wallet-shell)
<!-- AGREGAR ESTA LÍNEA AL INICIO, antes del div.wallet-shell: -->
<app-navbar></app-navbar>
<div class="wallet-shell">
 <!-- ... resto del contenido sin cambios ... -->
</div>
⚠️ El wallet-shell ya tiene padding propio. Verificar que no se superponga con el navbar. Si hay solapamiento, agregar
padding-top al .wallet-shell en el SCSS:
/* En customer-card.component.scss — agregar o ajustar: */
.wallet-shell {
 padding-top: calc(var(--nav-height) + 8px); /* 60px + 8px = 68px */
}
FIX 3 — Perfil de usuario (botón Profile → pantalla completa)
Situación actual
El bottom nav del customer-card tiene el tercer botón apuntando a /customer/qr en vez de /customer/profile. No
existe ruta ni componente de perfil. El usuario no puede editar sus datos ni cambiar contraseña.
Paso 1 — Corregir el routerLink en customer-card.component.html
📄 ARCHIVO: frontend/src/app/pages/customer-card/customer-card.component.html
Buscar el último bottom-nav-item y cambiar routerLink
<!-- ANTES (incorrecto): -->
<a class="bottom-nav-item" routerLink="/customer/qr">
<!-- DESPUÉS (correcto): -->
<a class="bottom-nav-item" routerLink="/customer/profile">
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ariahidden="true">
 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
 <circle cx="12" cy="7" r="4"/>
 </svg>
 <span>Profile</span>
 <span *ngIf="totalRewardsBadgeCount > 0" class="nav-badge">{{ totalRewardsBadgeCount
}}</span>
</a>
Paso 2 — Agregar la ruta en app.routes.ts
📄 ARCHIVO: frontend/src/app/app.routes.ts
Dentro del bloque 'customer' children, agregar la ruta profile
{
 path: 'profile',
 loadComponent: () => import('./pages/customer-profile/customer-profile.component')
 .then(m => m.CustomerProfileComponent)
},
Paso 3 — Agregar link Mi Perfil al drawer de navbar (customers)
📄 ARCHIVO: frontend/src/app/components/navbar.component.ts
Dentro del bloque <!-- Customer menu -->, agregar después del link Mi Código QR
<a class="nav-drawer-item" routerLink="/customer/profile"
 routerLinkActive="active" (click)="closeDrawer()">
 <span class="nav-drawer-icon">👤</span>
 Mi Perfil
</a>
Paso 4 — Crear el componente CustomerProfileComponent
📄 ARCHIVO: frontend/src/app/pages/customer-profile/customer-profile.component.ts
⚠️ El modelo AuthResponse (auth.service.ts) NO tiene avatarUrl ni phone en la respuesta de login. Phone sí existe en
User.java. Para el avatar, la entidad User necesita un campo avatarUrl nuevo (ver Paso 5 backend). Por ahora el código
muestra iniciales si no hay foto.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar.component';
import { AlertComponent } from '../../components/alert.component';
import { AuthService } from '../../services/auth.service';
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
 <app-alert [message]="successMsg" type="success" (dismissed)="successMsg=''"></appalert>
 <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg=''"></app-alert>
 <!-- Avatar -->`
 <div class="card" style="text-align:center; padding:24px; margin-bottom:16px;">
 <div style="position:relative; display:inline-block;">
 <img *ngIf="avatarUrl" [src]="avatarUrl" alt="Avatar"
 style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px
solid var(--primary);">
 <div *ngIf="!avatarUrl"
 style="width:96px;height:96px;border-radius:50%;background:var(--primarylight);
 display:flex;align-items:center;justify-content:center;fontsize:2.2rem;
 font-weight:700;color:var(--primary);">
 {{ initials }}
 </div>
 <label style="position:absolute;bottom:0;right:0;background:var(--
primary);color:white;
 border-radius:50%;width:28px;height:28px;display:flex;alignitems:center;
 justify-content:center;cursor:pointer;font-size:0.85rem;">
 📷
 <input type="file" accept="image/*" style="display:none"
(change)="onAvatarChange($event)">
 </label>
 </div>
 <div style="margin-top:10px;font-weight:700;font-size:1.1rem;">{{ form.firstName }}
{{ form.lastName }}</div>
 <div style="color:var(--text-muted);font-size:0.85rem;">{{ form.email }}</div>
 </div>
 <!-- Datos personales -->`
 <div class="card" style="padding:20px;margin-bottom:16px;">
 <h2 style="font-size:1rem;margin-bottom:16px;font-family:var(--font-display);">Datos
personales</h2>
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
 <input class="form-control" type="email" [(ngModel)]="form.email"
placeholder="Email">
 </div>
 <div class="form-group">
 <label class="form-label">Teléfono</label>
 <input class="form-control" [(ngModel)]="form.phone" placeholder="Teléfono">
 </div>
 <button class="btn btn-primary btn-full" [disabled]="saving"
(click)="saveProfile()">
 {{ saving ? 'Guardando...' : 'Guardar cambios' }}
 </button>
 </div>
 <!-- Cambiar contraseña -->`
 <div class="card" style="padding:20px;">
 <h2 style="font-size:1rem;margin-bottom:16px;font-family:var(--fontdisplay);">Cambiar contraseña</h2>
 <div class="form-group">
 <label class="form-label">Contraseña actual</label>
 <input class="form-control" type="password" [(ngModel)]="pwd.current"
placeholder="Contraseña actual">
 </div>
 <div class="form-group">
 <label class="form-label">Nueva contraseña</label>
 <input class="form-control" type="password" [(ngModel)]="pwd.newPwd"
placeholder="Nueva contraseña (min 6 caracteres)">
 </div>
 <div class="form-group">
 <label class="form-label">Confirmar nueva contraseña</label>
 <input class="form-control" type="password" [(ngModel)]="pwd.confirm"
placeholder="Repetir contraseña">
 </div>
 <button class="btn btn-outline btn-full" [disabled]="savingPwd"
(click)="changePassword()">
 {{ savingPwd ? 'Cambiando...' : 'Cambiar contraseña' }}
 </button>
 </div>
 </div>
 </div>
 `
})
export class CustomerProfileComponent implements OnInit {
 form: ProfileResponse = { firstName: '', lastName: '', email: '', phone: '', avatarUrl: ''
};
 pwd = { current: '', newPwd: '', confirm: '' };
 avatarUrl = '';
 saving = false;
 savingPwd = false;
 successMsg = '';
 errorMsg = '';
 get initials() {
 return (this.form.firstName?.[0] || '') + (this.form.lastName?.[0] || '');
 }
 constructor(private http: HttpClient, private authService: AuthService) {}
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
 this.form = { firstName: user.firstName, lastName: user.lastName,
 email: user.email, phone: '', avatarUrl: '' };
 }
 }
 });
 }
 onAvatarChange(event: any) {
 const file = event.target.files[0];
 if (!file) return;
 const formData = new FormData();
 formData.append('file', file);
 this.http.post<{ url: string }>(`${environment.apiUrl}/customer/avatar`,
formData).subscribe({
 next: (res) => { this.avatarUrl = res.url; this.successMsg = '📷 Foto actualizada'; },
 error: () => { this.errorMsg = 'Error al subir la foto'; }
 });
 }
 saveProfile() {
 if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.email.trim())
{
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
 ...user, firstName: updated.firstName, lastName: updated.lastName, email:
updated.email
 }));
 }
 },
 error: (e) => { this.errorMsg = e.error?.error || 'Error al guardar'; this.saving =
false; }
 });
 }
 changePassword() {
 if (!this.pwd.current) { this.errorMsg = 'Ingresá tu contraseña actual'; return; }
 if (this.pwd.newPwd.length < 6) { this.errorMsg = 'La nueva contraseña debe tener al menos
6 caracteres'; return; }
 if (this.pwd.newPwd !== this.pwd.confirm) { this.errorMsg = 'Las contraseñas no
coinciden'; return; }
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
Paso 5 — Backend: 3 endpoints nuevos en CustomerController.java
📄 ARCHIVO: backend/src/main/java/com/loyalty/controller/CustomerController.java
package com.loyalty.controller;
import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.User;
import com.loyalty.repository.UserRepository;
import com.loyalty.service.FileStorageService;
import com.loyalty.service.LoyaltyCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
@RestController
@RequestMapping("/api/customer")
public class CustomerController {
 private final LoyaltyCardService loyaltyCardService;
 private final UserRepository userRepository;
 private final PasswordEncoder passwordEncoder;
 private final FileStorageService fileStorageService;
 public CustomerController(LoyaltyCardService loyaltyCardService,
 UserRepository userRepository,
PasswordEncoder passwordEncoder,
FileStorageService fileStorageService) {
 this.loyaltyCardService = loyaltyCardService;
 this.userRepository = userRepository;
 this.passwordEncoder = passwordEncoder;
 this.fileStorageService = fileStorageService;
 }
 // ── Endpoints existentes ──────────────────────────────────────────
 @GetMapping("/card")
 public ResponseEntity<LoyaltyCardDto> getMyCard(@AuthenticationPrincipal User user) {
 return ResponseEntity.ok(loyaltyCardService.getLoyaltyCard(user.getId()));
 }
 @GetMapping("/qr")
 public ResponseEntity<String> getMyQrCode(@AuthenticationPrincipal User user) {
 return ResponseEntity.ok(loyaltyCardService.getQrCodeImage(user.getId()));
 }
 // ── NUEVOS endpoints para perfil ──────────────────────────────────
 /** GET /api/customer/profile — devuelve datos del usuario autenticado */
 @GetMapping("/profile")
 public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
 return ResponseEntity.ok(Map.of(
 "firstName", user.getFirstName(),
 "lastName", user.getLastName(),
 "email", user.getEmail(),
 "phone", user.getPhone() != null ? user.getPhone() : "",
 "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
 ));
 }
 /** PUT /api/customer/profile — actualiza nombre, apellido, email, teléfono */
 @PutMapping("/profile")
 public ResponseEntity<?> updateProfile(
 @AuthenticationPrincipal User user,
 @RequestBody Map<String, String> body) {
 try {
 String newEmail = body.get("email");
 // Verificar que el email no esté en uso por otro usuario
 if (newEmail != null && !newEmail.equals(user.getEmail())) {
 if (userRepository.existsByEmail(newEmail)) {
 return ResponseEntity.badRequest()
 .body(Map.of("error", "El email ya está en uso"));
 }
 user.setEmail(newEmail);
 }
 if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
 if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
 if (body.containsKey("phone")) user.setPhone(body.get("phone"));
 userRepository.save(user);
 return ResponseEntity.ok(Map.of(
 "firstName", user.getFirstName(),
 "lastName", user.getLastName(),
 "email", user.getEmail(),
 "phone", user.getPhone() != null ? user.getPhone() : ""
 ));
 } catch (Exception e) {
 return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
 }
 }
 /** PUT /api/customer/change-password — valida contraseña actual y cambia */
 @PutMapping("/change-password")
 public ResponseEntity<?> changePassword(
 @AuthenticationPrincipal User user,
 @RequestBody Map<String, String> body) {
 try {
 String currentPassword = body.get("currentPassword");
 String newPassword = body.get("newPassword");
 if (currentPassword == null || newPassword == null) {
 return ResponseEntity.badRequest().body(Map.of("error", "Faltan campos"));
 }
 if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
 return ResponseEntity.badRequest().body(Map.of("error", "Contraseña actual
incorrecta"));
 }
 if (newPassword.length() < 6) {
 return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe
tener al menos 6 caracteres"));
 }
 user.setPassword(passwordEncoder.encode(newPassword));
 userRepository.save(user);
 return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
 } catch (Exception e) {
 return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
 }
 }
 /** POST /api/customer/avatar — sube foto de perfil */
 @PostMapping("/avatar")
 public ResponseEntity<?> uploadAvatar(
 @AuthenticationPrincipal User user,
 @RequestParam("file") MultipartFile file) {
 try {
 String url = fileStorageService.storeFile(file, "avatars");
 user.setAvatarUrl(url);
 userRepository.save(user);
 return ResponseEntity.ok(Map.of("url",
 url.startsWith("/uploads") ? buildPublicUrl(url) : url));
 } catch (Exception e) {
 return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
 }
 }
 private String buildPublicUrl(String path) {
 // /uploads/avatars/uuid.jpg → /api/files/avatars/uuid.jpg
 String[] parts = path.split("/");
 return "/api/files/" + parts[2] + "/" + parts[3];
 }
}
Paso 6 — Backend: Agregar campo avatarUrl a User.java
📄 ARCHIVO: backend/src/main/java/com/loyalty/entity/User.java
Agregar el campo (Hibernate lo crea automáticamente con ddl-auto=update)
// Agregar dentro de la clase User, después del campo 'qrCode':
@Column
private String avatarUrl;
// Y sus getters/setters:
public String getAvatarUrl() { return avatarUrl; }
public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
FIX 4 — Stats del dashboard asimétricas en móvil 360px
Causa
Con 360px de ancho menos paddings, cada stat-tile en grid de 3 columnas queda ~100px de ancho. El font-size
clamp y el padding de 16px/12px hace que el número se corte o se apile.
📄 ARCHIVO: frontend/src/app/pages/admin-dashboard/admin-dashboard.component.ts
Reemplazar el bloque @media (max-width: 400px) en los estilos del componente
/* REEMPLAZAR el @media (max-width: 400px) existente por: */
@media (max-width: 400px) {
 .dash-stats {
 grid-template-columns: repeat(3, 1fr);
 gap: 4px;
 }
 .stat-tile {
 padding: 10px 4px;
 }
 .stat-tile-icon {
 font-size: 1.1rem;
 margin-bottom: 3px;
 }
 .stat-tile-value {
 font-size: 1.25rem !important; /* override del clamp */
 line-height: 1;
 }
 .stat-tile-label {
 font-size: 0.55rem;
 letter-spacing: 0;
 line-height: 1.2;
 }
}
FIX 5 — Niveles de fidelidad desbordan el contenedor en móvil
Causa
El tier-item usa display:flex horizontal sin flex-wrap ni overflow control. Los botones 'Desactivar' + junto con
texto largo se solapan con los bordes. Además el styles[] del componente está vacío (`styles: []`) — todos los
estilos de .tier-item vienen del global styles.css que define un layout sin flex-wrap.
📄 ARCHIVO: frontend/src/app/pages/fidelity-tiers/fidelity-tiers.component.ts
1) Reemplazar el bloque *ngFor de tiers en el template
<!-- Buscar el div del *ngFor="let tier of tiers" y reemplazarlo por: -->
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
 <div style="font-weight:600; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis;
white-space:nowrap;">
 {{ tier.rewardDescription }}
 </div>
 <span class="badge" [class.badge-success]="tier.isActive" [class.badgesecondary]="!tier.isActive">
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
2) Agregar estilos al array styles[] del componente (actualmente vacío)
styles: [`
 .tier-item {
 padding: 14px 0;
 border-bottom: 1px solid var(--border);
 display: flex;
 flex-direction: column;
 }
 .tier-item:last-child { border-bottom: none; }
`]
FIX 6 — "Reward not in requested state" al aprobar canje
Causa raíz
Los IDs de las tablas 'rewards' y 'fidelity_rewards' son independientes (auto-increment por separado). El
AdminRedemptionController busca SIEMPRE primero en rewardRepository.findById(id). Si existe un Reward con
ese mismo ID pero con status AVAILABLE, el código devuelve el error aunque el admin quiera aprobar un
FidelityReward.
El frontend SABE el tipo porque lo tiene en el campo 'type' de cada solicitud ("CARD" o "FIDELITY"), pero NO lo
envía al hacer el POST de approve/reject.
Parte A — Frontend: enviar rewardType al aprobar/rechazar
📄 ARCHIVO: frontend/src/app/pages/admin-redemptions/admin-redemptions.component.ts
Reemplazar los métodos approveRequest y rejectRequest
approveRequest(req: RedemptionRequest) {
 this.http.post(`${this.apiUrl}/${req.id}/approve`, { rewardType: req.type }).subscribe({
 next: () => {
 this.successMsg = 'Solicitud aprobada';
 this.loadRequests();
 setTimeout(() => this.successMsg = '', 3000);
 },
 error: (err) => {
 this.errorMsg = err.error?.error || 'Error al aprobar';
 setTimeout(() => this.errorMsg = '', 3000);
 }
 });
}
rejectRequest(req: RedemptionRequest) {
 const reason = prompt('Motivo del rechazo (opcional):');
 this.http.post(`${this.apiUrl}/${req.id}/reject`, { reason, rewardType: req.type
}).subscribe({
 next: () => {
 this.successMsg = 'Solicitud rechazada';
 this.loadRequests();
 setTimeout(() => this.successMsg = '', 3000);
 },
 error: (err) => {
 this.errorMsg = err.error?.error || 'Error al rechazar';
 setTimeout(() => this.errorMsg = '', 3000);
 }
 });
}
Parte B — Backend: usar rewardType para buscar en la tabla correcta
📄 ARCHIVO: backend/src/main/java/com/loyalty/controller/AdminRedemptionController.java
Reemplazar los métodos approveRedemption y rejectRedemption COMPLETOS
@PostMapping("/{id}/approve")
public ResponseEntity<?> approveRedemption(
 @AuthenticationPrincipal User admin,
 @PathVariable Long id,
 @RequestBody(required = false) Map<String, Object> body) {
 try {
 String rewardType = body != null ? (String) body.get("rewardType") : null;
 if ("FIDELITY".equals(rewardType)) {
 // Buscar SOLO en fidelity_rewards
 FidelityReward fr = fidelityRewardRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Fidelity reward no encontrado: " + id));
 if (fr.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
 return ResponseEntity.badRequest()
 .body(Map.of("error", "La recompensa no está en estado solicitado"));
 }
 fr.setStatus(FidelityReward.RewardStatus.REDEEMED);
 fr.setApprovedAt(LocalDateTime.now());
 fr.setRedeemedAt(LocalDateTime.now());
 fidelityRewardRepository.save(fr);
 return ResponseEntity.ok(Map.of("message", "Recompensa de fidelidad aprobada"));
 } else {
 // CARD o tipo no especificado → buscar en rewards
 Reward reward = rewardRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Reward no encontrado: " + id));
 if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
 return ResponseEntity.badRequest()
 .body(Map.of("error", "La recompensa no está en estado solicitado"));
 }
 reward.setStatus(Reward.RewardStatus.REDEEMED);
 reward.setApprovedAt(LocalDateTime.now());
 reward.setRedeemedAt(LocalDateTime.now());
 rewardRepository.save(reward);
 return ResponseEntity.ok(Map.of("message", "Recompensa aprobada"));
 }
 } catch (Exception e) {
 return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
 }
}
@PostMapping("/{id}/reject")
public ResponseEntity<?> rejectRedemption(
 @AuthenticationPrincipal User admin,
 @PathVariable Long id,
 @RequestBody(required = false) Map<String, String> body) {
 try {
 String reason = body != null ? body.get("reason") : null;
 String rewardType = body != null ? body.get("rewardType") : null;
 if ("FIDELITY".equals(rewardType)) {
 FidelityReward fr = fidelityRewardRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Fidelity reward no encontrado: " + id));
 if (fr.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
 return ResponseEntity.badRequest()
 .body(Map.of("error", "La recompensa no está en estado solicitado"));
 }
 fr.setStatus(FidelityReward.RewardStatus.REJECTED);
 fr.setRejectedAt(LocalDateTime.now());
 fr.setRejectionReason(reason);
 fr.setRequestedAt(null);
 fidelityRewardRepository.save(fr);
 return ResponseEntity.ok(Map.of("message", "Recompensa rechazada"));
 } else {
 Reward reward = rewardRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Reward no encontrado: " + id));
 if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
 return ResponseEntity.badRequest()
 .body(Map.of("error", "La recompensa no está en estado solicitado"));
 }
 reward.setStatus(Reward.RewardStatus.REJECTED);
 reward.setRejectedAt(LocalDateTime.now());
 reward.setRejectionReason(reason);
 reward.setRequestedAt(null);
 rewardRepository.save(reward);
 return ResponseEntity.ok(Map.of("message", "Recompensa rechazada"));
 }
 } catch (Exception e) {
 return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
 }
}
FIX 7 — Tab 'Rechazados' siempre vacío
Causa
Al rechazar, el código actual devolvía el reward a status AVAILABLE (no a REJECTED). El @GetMapping filtraba
'rejected' buscando status REJECTED pero no existía ese estado en el enum, por lo tanto devolvía lista vacía.
Parte A — Agregar REJECTED a los enums
📄 ARCHIVO: backend/src/main/java/com/loyalty/entity/Reward.java
Reemplazar el enum RewardStatus
public enum RewardStatus {
 AVAILABLE, REDEEMED, REQUESTED, REJECTED // ✅ AGREGAR REJECTED
}
📄 ARCHIVO: backend/src/main/java/com/loyalty/entity/FidelityReward.java
Reemplazar el enum RewardStatus
public enum RewardStatus {
 AVAILABLE, REDEEMED, REQUESTED, REJECTED // ✅ AGREGAR REJECTED
}
Parte B — Actualizar la tabla MySQL
⚠️ Con ddl-auto=update Hibernate NO modifica columnas ENUM existentes automáticamente. Hay que correr este
SQL manualmente:
ALTER TABLE rewards
 MODIFY COLUMN status ENUM('AVAILABLE','REDEEMED','REQUESTED','REJECTED') NOT NULL;
ALTER TABLE fidelity_rewards
 MODIFY COLUMN status ENUM('AVAILABLE','REDEEMED','REQUESTED','REJECTED') NOT NULL;
Parte C — Corregir el @GetMapping para incluir REJECTED en la query 'rejected'
📄 ARCHIVO: backend/src/main/java/com/loyalty/controller/AdminRedemptionController.java
Reemplazar el bloque de filtrado en el @GetMapping
// DENTRO del método getRedemptions(), reemplazar los bloques if/else por:
List<Reward> cardRewards;
List<FidelityReward> fidelityRewards;
switch (status) {
 case "pending" -> {
 cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REQUESTED);
 fidelityRewards =
fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REQUESTED);
 }
 case "approved" -> {
 cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REDEEMED);
 fidelityRewards =
fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REDEEMED);
 }
 case "rejected" -> {
 cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REJECTED);
 fidelityRewards =
fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REJECTED);
 }
 default -> {
 cardRewards = new ArrayList<>();
 fidelityRewards = new ArrayList<>();
 }
}
ℹ️ El frontend ya filtra por activeTab ('pending'/'approved'/'rejected') y lo envía como query param ?status=rejected. El
backend ahora responde correctamente.
Parte D — FidelityReward frontend: agregar REJECTED al type
📄 ARCHIVO: frontend/src/app/models/models.ts
Agregar REJECTED al tipo status de FidelityReward y Reward
export interface Reward {
 id: number;
 description: string;
 status: 'AVAILABLE' | 'REQUESTED' | 'REDEEMED' | 'REJECTED'; // ✅ agregar REJECTED
 earnedAt: string;
 redeemedAt?: string;
}
export interface FidelityReward {
 id: number;
 description: string;
 status: 'AVAILABLE' | 'REQUESTED' | 'REDEEMED' | 'REJECTED'; // ✅ agregar REJECTED
 cardsRequired: number;
 earnedAt: string;
 redeemedAt?: string;
}
FIX 8 — Canjes: botón Rechazar no visible en móvil
Causa
El layout horizontal de cada request-item hace que con texto largo (email, descripción) los botones
Aprobar/Rechazar queden apretados o fuera del viewport en pantallas angostas. El styles[] del componente está
vacío — hay que agregar los estilos.
📄 ARCHIVO: frontend/src/app/pages/admin-redemptions/admin-redemptions.component.ts
Reemplazar el template completo del componente
template: `
 <app-navbar></app-navbar>
 <div class="container-wide" style="padding-top:24px; padding-bottom:48px;">
 <div class="page-header">
 <a routerLink="/admin/dashboard" class="page-back">← {{ 'common.back' | translate }}</a>
 <h1 class="page-title">🎁 Solicitudes de canje</h1>
 <p class="page-subtitle">Aprobá o rechazá las recompensas solicitadas.</p>
 </div>
 <app-loading *ngIf="loading"></app-loading>
 <app-alert [message]="successMsg" type="success" (dismissed)="successMsg=''"></app-alert>
 <app-alert [message]="errorMsg" type="error" (dismissed)="errorMsg=''"></app-alert>
 <!-- Tabs -->
 <div class="tab-bar">
 <button class="tab-btn" [class.tab-active]="activeTab==='pending'"
 (click)="activeTab='pending'; loadRequests()">⏳ Pendientes</button>
 <button class="tab-btn" [class.tab-active]="activeTab==='approved'"
 (click)="activeTab='approved'; loadRequests()">✅ Aprobados</button>
 <button class="tab-btn" [class.tab-active]="activeTab==='rejected'"
 (click)="activeTab='rejected'; loadRequests()">❌ Rechazados</button>
 </div>
 <div class="card fade-in">
 <div *ngIf="requests.length === 0" class="empty-state">
 <div class="empty-state-icon">📭</div>
 <div class="empty-state-title">
 No hay solicitudes {{ activeTab === 'pending' ? 'pendientes' : activeTab ===
'approved' ? 'aprobadas' : 'rechazadas' }}
 </div>
 </div>
 <div *ngFor="let req of requests" class="req-item">
 <!-- Fila superior: ícono + info -->
 <div class="req-top">
 <div class="req-icon">{{ req.type === 'CARD' ? '🎁' : '🏆' }}</div>
 <div class="req-info">
 <div class="req-name">{{ req.customerName }}</div>
 <div class="req-email">{{ req.customerEmail }}</div>
 <div class="req-desc">{{ req.description }}</div>
 <div class="req-meta">
 {{ req.requestedAt | date:'dd/MM/yyyy HH:mm' }}
 <span *ngIf="req.type === 'FIDELITY'"> · 🎯 {{ req.cardsRequired }}
tarjetas</span>
 </div>
 </div>
 </div>
 <!-- Fila inferior: siempre visible -->
 <div class="req-actions" *ngIf="activeTab === 'pending'">
 <button class="btn btn-sm btn-approve" (click)="approveRequest(req)">✅
Aprobar</button>
 <button class="btn btn-sm btn-reject" (click)="rejectRequest(req)">❌
Rechazar</button>
 </div>
 <div class="req-status" *ngIf="activeTab !== 'pending'">
 <span *ngIf="activeTab === 'approved'" class="badge badge-success">✅
Aprobado</span>
 <span *ngIf="activeTab === 'rejected'" class="badge badge-danger">❌
Rechazado</span>
 </div>
 </div>
 </div>
 </div>
`
Reemplazar el styles: [] vacío por estos estilos
styles: [`
 .tab-bar { display:flex; gap:8px; margin-bottom:20px;
 border-bottom:1px solid var(--border); padding-bottom:8px; }
 .tab-btn { background:transparent; border:none; padding:8px 14px;
 border-radius:var(--r-sm); cursor:pointer; font-family:var(--font-body);
 font-size:0.85rem; font-weight:600; color:var(--text-secondary);
 transition:all 0.2s; }
 .tab-btn:hover { color:var(--text-primary); }
 .tab-active { background:var(--primary); color:white !important; }
 .req-item { padding:14px 0; border-bottom:1px solid var(--border); }
 .req-item:last-child { border-bottom:none; }
 .req-top { display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; }
 .req-icon { width:44px; height:44px; border-radius:50%; background:var(--primary-light);
 display:flex; align-items:center; justify-content:center;
 font-size:1.2rem; flex-shrink:0; }
 .req-info { flex:1; min-width:0; }
 .req-name { font-weight:600; font-size:0.9rem; }
 .req-email { font-size:0.75rem; color:var(--text-muted);
 white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
 .req-desc { font-size:0.88rem; margin:3px 0; }
 .req-meta { font-size:0.72rem; color:var(--text-muted); }
 .req-actions { display:flex; gap:8px; }
 .btn-approve { flex:1; background:#4caf50; color:white; }
 .btn-reject { flex:1; background:#dc3545; color:white; }
 .req-status { display:flex; justify-content:flex-end; }
`]
FIX 9 — Traducciones faltantes
Problema
Se ven textos literales como 'admin.appearance', 'admin.fidelity', 'admin.recentCustomers', '← COMMON.BACK'.
Esto pasa porque: (a) las claves no existen en el JSON, o (b) se escribieron en MAYÚSCULAS en el template (el
pipe translate es case-sensitive).
📄 ARCHIVO: frontend/src/assets/i18n/en.json
Agregar las claves faltantes en la sección "admin"
"admin": {
 "dashboard": "Dashboard",
 "welcomeBack": "Welcome back",
 "totalCustomers": "Total customers",
 "stampsGiven": "Stamps given",
 "rewardsEarned": "Rewards earned",
 "scanQr": "Scan QR",
 "searchCustomers": "Search customers",
 "customersList": "Customers",
 "noCustomers": "No customers yet",
 "recentCustomers": "Recent customers",
 "appearance": "Appearance",
 "fidelity": "Loyalty Tiers",
 "fidelityTiers": "Loyalty Tiers",
 "recentActivity": "Recent activity",
 "scanTitle": "Scan QR Code",
 "scanSubtitle": "Scan a customer's QR to add a stamp",
 "stampAdded": "Stamp added successfully!",
 "confirmScan": "Add stamp",
 "searchPlaceholder": "Search by name or email...",
 "manualCode": "Or enter code manually",
 "enterCode": "Enter QR code"
}
📄 ARCHIVO: frontend/src/assets/i18n/es.json
Agregar las claves faltantes en la sección "admin"
"admin": {
 "dashboard": "Panel",
 "welcomeBack": "Bienvenido de nuevo",
 "totalCustomers": "Total de clientes",
 "stampsGiven": "Sellos otorgados",
 "rewardsEarned": "Recompensas ganadas",
 "scanQr": "Escanear QR",
 "searchCustomers": "Buscar clientes",
 "customersList": "Clientes",
 "noCustomers": "Aún no hay clientes",
 "recentCustomers": "Clientes recientes",
 "appearance": "Apariencia",
 "fidelity": "Niveles de fidelidad",
 "fidelityTiers": "Niveles de fidelidad",
 "recentActivity": "Actividad reciente",
 "scanTitle": "Escanear código QR",
 "scanSubtitle": "Escaneá el QR de un cliente para agregar un sello",
 "stampAdded": "¡Sello agregado con éxito!",
 "confirmScan": "Agregar sello",
 "searchPlaceholder": "Buscar por nombre o email...",
 "manualCode": "O ingresá el código manualmente",
 "enterCode": "Ingresá el código QR"
}
Verificar que 'common.back' esté en minúsculas en TODO el código
⚠️ Los templates que muestran '← COMMON.BACK' usan la clave en MAYÚSCULAS. El pipe translate es casesensitive. Buscar y reemplazar en todos los componentes:
// BUSCAR en todos los archivos .ts y .html:
"COMMON.BACK" → reemplazar por "common.back"
// Archivos donde aparece (según el snapshot):
// - fidelity-tiers.component.ts
// - admin-redemptions.component.ts
// La clave 'common.back' YA EXISTE en ambos JSON con el valor correcto:
// en.json: "back": "Back"
// es.json: "back": "Volver"
// Solo hay que asegurarse de escribirla en minúsculas en el template.
Resumen: archivos modificados
Archivo Tipo Cambio
theme.service.ts Frontend loadFromServer() con cache previo +
BehaviorSubject theme$
login.component.ts Frontend Suscripción reactiva a theme$ para
loginLogoSize
customer-card.component.html Frontend Agregar <app-navbar> al inicio + routerLink
Profile
customer-card.component.ts Frontend Importar NavbarComponent
customer-card.component.scss Frontend Agregar padding-top para no solapar con
navbar
navbar.component.ts Frontend Agregar link Mi Perfil al drawer customer
app.routes.ts Frontend Agregar ruta /customer/profile
customer-profile.component.ts Frontend — NUEVO Pantalla perfil completa con foto, datos y
contraseña
admin-dashboard.component.ts Frontend @media 400px mejorado para móvil 360px
fidelity-tiers.component.ts Frontend Layout vertical de tier-item + styles[]
admin-redemptions.component.ts Frontend Enviar rewardType + layout móvil + styles[]
models.ts Frontend Agregar REJECTED a enums de Reward y
FidelityReward
en.json + es.json Frontend Claves appearance, fidelity, recentCustomers,
stampsGiven, rewardsEarned
CustomerController.java Backend —
MODIFICADO
Agregar endpoints profile, change-password,
avatar
AdminRedemptionController.java Backend Usar rewardType para buscar en tabla
correcta + REJECTED
Reward.java Backend Agregar REJECTED al enum RewardStatus
FidelityReward.java Backend Agregar REJECTED al enum RewardStatus
User.java Backend Agregar campo avatarUrl + getter/setter
schema.sql / MySQL Base de datos ALTER TABLE para agregar REJECTED a
ENUMs
Documento generado con análisis completo del snapshot del proyecto. Todos los cambios son consistentes con la arquitectura existente.
