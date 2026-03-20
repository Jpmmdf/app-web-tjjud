import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import packageJson from '../../../../package.json';
import { ptBrCatalogMessages } from '../i18n/pt-br';
import { CatalogFacadeService } from '../state/catalog-facade.service';

type NavigationItem = (typeof ptBrCatalogMessages.app.navigation)[number];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly appTexts = ptBrCatalogMessages.app;
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly navigationItems: readonly NavigationItem[] = this.appTexts.navigation;
  protected readonly appVersion = packageJson.version;
  protected readonly mobileNavOpen = signal(false);

  async ngOnInit(): Promise<void> {
    await this.catalog.refreshAll();
  }

  protected toggleMobileNavigation(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNavigation(): void {
    this.mobileNavOpen.set(false);
  }
}
