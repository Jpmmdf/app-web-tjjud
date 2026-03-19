
import { Component, OnInit, inject } from '@angular/core';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { AuthorPanelComponent } from '../../authors/components/author-panel.component';
import { BookPanelComponent } from '../../books/components/book-panel.component';
import { ReportPanelComponent } from '../../reports/components/report-panel.component';
import { SubjectPanelComponent } from '../../subjects/components/subject-panel.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    AuthorPanelComponent,
    SubjectPanelComponent,
    BookPanelComponent,
    ReportPanelComponent
],
  templateUrl: './catalog-page.component.html',
})
export class CatalogPageComponent implements OnInit {
  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly appTexts = ptBrCatalogMessages.app;
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly sections = this.appTexts.sections;

  async ngOnInit(): Promise<void> {
    await this.catalog.refreshAll();
  }

  protected jumpTo(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
