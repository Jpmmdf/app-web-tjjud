
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { formatTimestamp, joinSubjectDescriptions } from '../../../shared/formatters/catalog-formatters';

@Component({
  selector: 'app-report-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './report-panel.component.html',
  styleUrl: './report-panel.component.scss',
})
export class ReportPanelComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.reports;
  protected readonly reportFilterControl = this.fb.control<number | null>(this.catalog.currentReportAuthorId());

  protected async loadReport(): Promise<void> {
    await this.catalog.loadReport(this.reportFilterControl.value);
  }

  protected resetReportFilter(): void {
    this.reportFilterControl.reset(null);
    void this.catalog.loadReport(null);
  }

  protected async downloadReport(): Promise<void> {
    await this.catalog.downloadReport(this.reportFilterControl.value);
  }

  protected formatTimestamp(timestamp: string | null | undefined): string {
    return formatTimestamp(timestamp);
  }

  protected reportSubjects(subjects: ReadonlyArray<{ description: string }>): string {
    return joinSubjectDescriptions(subjects);
  }
}
