import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  slug = this.slugService.get() ?? '';
  businessName = this.slugService.getTenant()?.name ?? this.slugService.get() ?? '';

  constructor(
    private authService: AuthService,
    private slugService: SlugService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(this.authService.homeRoute());
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}
