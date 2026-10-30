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
  templateUrl: './platform-business-detail.component.html',
  styleUrls: ['./platform-business-detail.component.css']
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
