import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './services/theme.service';
import { InstallPromptComponent } from './components/install-prompt.component';  // ← NUEVO

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InstallPromptComponent],  // ← AGREGAR InstallPromptComponent
  template: `
    <router-outlet></router-outlet>
    <app-install-prompt></app-install-prompt>  <!-- ← NUEVO -->
  `
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }
}
