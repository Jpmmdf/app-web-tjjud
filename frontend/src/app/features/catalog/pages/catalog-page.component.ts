import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent {
  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly appTexts = ptBrCatalogMessages.app;
  protected readonly sections = this.appTexts.sections;
}
