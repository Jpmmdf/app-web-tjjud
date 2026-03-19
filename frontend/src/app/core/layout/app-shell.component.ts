import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ptBrCatalogMessages } from '../i18n/pt-br';
import { CatalogFacadeService } from '../state/catalog-facade.service';

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
  protected readonly navigationItems = this.appTexts.navigation;

  async ngOnInit(): Promise<void> {
    await this.catalog.refreshAll();
  }
}
