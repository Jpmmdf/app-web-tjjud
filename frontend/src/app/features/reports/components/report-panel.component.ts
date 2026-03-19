import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { SortDirection } from '../../../core/models/common.models';
import type { ReportBookItem } from '../../../core/models/reports.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { formatCurrencyValue, formatTimestamp } from '../../../shared/formatters/catalog-formatters';

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
  protected readonly reportFilterControl = this.fb.control<number | null>(this.catalog.currentReportList().authorId);
  protected readonly sortControl = this.fb.nonNullable.control<ReportSortOption>(this.toSortOption(
    this.catalog.currentReportList().sortField,
    this.catalog.currentReportList().sortDirection,
  ));

  protected async loadReport(): Promise<void> {
    await this.catalog.loadReport({
      authorId: this.reportFilterControl.value,
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected resetReportFilter(): void {
    this.reportFilterControl.reset(null);
    void this.catalog.loadReport({ authorId: null, page: 0 });
  }

  protected async downloadReport(): Promise<void> {
    await this.catalog.downloadReport(this.reportFilterControl.value);
  }

  protected formatTimestamp(timestamp: string | null | undefined): string {
    return formatTimestamp(timestamp);
  }

  protected visibleBookCount(): number {
    return (this.catalog.report()?.items ?? []).reduce((total, group) => total + group.books.length, 0);
  }

  protected reportPrice(price: string): string {
    return formatCurrencyValue(price);
  }

  protected activeAuthorLabel(): string {
    const activeAuthorId = this.catalog.currentReportList().authorId;
    if (activeAuthorId === null) {
      return this.commonTexts.allAuthors;
    }
    return this.catalog.authorOptions().find((author) => author.id === activeAuthorId)?.name ?? this.commonTexts.allAuthors;
  }

  protected bookMeta(book: ReportBookItem): string[] {
    return [
      `${this.texts.card.publisherLabel}: ${book.publisher}`,
      `${this.texts.card.yearLabel}: ${book.publicationYear}`,
      `${this.texts.card.editionLabel}: ${book.edition}`,
    ];
  }

  protected async goToPage(page: number): Promise<void> {
    await this.catalog.loadReport({ page });
  }

  protected hasPreviousPage(): boolean {
    return this.catalog.reportPage().page > 0;
  }

  protected hasNextPage(): boolean {
    return this.catalog.reportPage().page + 1 < this.catalog.reportPage().totalPages;
  }

  private fromSortOption(option: ReportSortOption): { sortField: string; sortDirection: SortDirection } {
    switch (option) {
      case 'authorNameDesc':
        return { sortField: 'authorName', sortDirection: 'DESC' };
      case 'bookCountDesc':
        return { sortField: 'bookCount', sortDirection: 'DESC' };
      case 'bookCountAsc':
        return { sortField: 'bookCount', sortDirection: 'ASC' };
      case 'authorNameAsc':
      default:
        return { sortField: 'authorName', sortDirection: 'ASC' };
    }
  }

  private toSortOption(field: string, direction: SortDirection): ReportSortOption {
    if (field === 'bookCount') {
      return direction === 'DESC' ? 'bookCountDesc' : 'bookCountAsc';
    }
    return direction === 'DESC' ? 'authorNameDesc' : 'authorNameAsc';
  }
}

type ReportSortOption = 'authorNameAsc' | 'authorNameDesc' | 'bookCountDesc' | 'bookCountAsc';
