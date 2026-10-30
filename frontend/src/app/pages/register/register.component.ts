import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SlugService } from '../../services/slug.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', phone: '' };
  loading = false;
  error = '';
  slug = this.slugService.get() ?? '';

  constructor(
    private authService: AuthService,
    private slugService: SlugService,
    private router: Router
  ) {}

  onRegister(): void {
    this.error = '';
    this.loading = true;
    this.authService.register({
      email: this.form.email.trim(),
      password: this.form.password,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      phone: this.form.phone || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(this.authService.homeRoute());
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}
