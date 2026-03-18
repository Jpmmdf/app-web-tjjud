import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CatalogApiService } from '../api/catalog-api.service';
import { ptBrCatalogMessages } from '../i18n/pt-br';
import { Author, AuthorBookReport, Book, BookUpsertPayload, ProblemResponse, Subject } from '../models/catalog.models';
import { formatCurrencyTotal } from '../../shared/formatters/catalog-formatters';

export interface FlashMessage {
  kind: 'success' | 'error';
  title: string;
  detail: string;
}

export interface BookFilters {
  title: string;
  authorId: number | null;
  subjectId: number | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogFacadeService {
  private readonly api = inject(CatalogApiService);
  private readonly messages = ptBrCatalogMessages;

  readonly loading = signal(true);
  readonly pendingRequests = signal(0);
  readonly flash = signal<FlashMessage | null>(null);

  readonly authors = signal<Author[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly books = signal<Book[]>([]);
  readonly report = signal<AuthorBookReport | null>(null);

  readonly currentAuthorQuery = signal('');
  readonly currentSubjectQuery = signal('');
  readonly currentBookFilters = signal<BookFilters>({
    title: '',
    authorId: null,
    subjectId: null,
  });
  readonly currentReportAuthorId = signal<number | null>(null);

  readonly isBusy = computed(() => this.pendingRequests() > 0);
  readonly authorCount = computed(() => this.authors().length);
  readonly subjectCount = computed(() => this.subjects().length);
  readonly bookCount = computed(() => this.books().length);
  readonly reportGroupCount = computed(() => this.report()?.authors.length ?? 0);
  readonly catalogGrossValue = computed(() =>
    this.books().reduce((total, book) => total + Number.parseFloat(book.price), 0),
  );
  readonly formattedCatalogGrossValue = computed(() => formatCurrencyTotal(this.catalogGrossValue()));

  async refreshAll(): Promise<void> {
    this.loading.set(true);
    await Promise.all([
      this.loadAuthors(),
      this.loadSubjects(),
      this.loadBooks(),
      this.loadReport(),
    ]);
    this.loading.set(false);
  }

  clearFlash(): void {
    this.flash.set(null);
  }

  async loadAuthors(query = this.currentAuthorQuery()): Promise<void> {
    this.currentAuthorQuery.set(query);
    const response = await this.runRequest(
      () => firstValueFrom(this.api.listAuthors(query)),
      this.messages.authors.messages.loadError,
    );
    if (response) {
      this.authors.set(response.items);
    }
  }

  async saveAuthor(authorId: number | null, payload: Pick<Author, 'name'>): Promise<Author | undefined> {
    const response = await this.runRequest(
      () =>
        authorId == null
          ? firstValueFrom(this.api.createAuthor(payload))
          : firstValueFrom(this.api.updateAuthor(authorId, payload)),
      authorId == null ? this.messages.authors.messages.createError : this.messages.authors.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      authorId == null ? this.messages.authors.messages.createSuccessTitle : this.messages.authors.messages.updateSuccessTitle,
      this.messages.authors.messages.saveSuccessDetail(response.name),
    );
    await Promise.all([this.loadAuthors(), this.loadBooks(), this.loadReport()]);
    return response;
  }

  async deleteAuthor(author: Author): Promise<boolean> {
    if (!window.confirm(this.messages.authors.confirmDelete(author.name))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.api.deleteAuthor(author.id)),
      this.messages.authors.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.authors.messages.deleteSuccessTitle,
      this.messages.authors.messages.deleteSuccessDetail(author.name),
    );
    await Promise.all([this.loadAuthors(), this.loadBooks(), this.loadReport()]);
    return true;
  }

  async loadSubjects(query = this.currentSubjectQuery()): Promise<void> {
    this.currentSubjectQuery.set(query);
    const response = await this.runRequest(
      () => firstValueFrom(this.api.listSubjects(query)),
      this.messages.subjects.messages.loadError,
    );
    if (response) {
      this.subjects.set(response.items);
    }
  }

  async saveSubject(subjectId: number | null, payload: Pick<Subject, 'description'>): Promise<Subject | undefined> {
    const response = await this.runRequest(
      () =>
        subjectId == null
          ? firstValueFrom(this.api.createSubject(payload))
          : firstValueFrom(this.api.updateSubject(subjectId, payload)),
      subjectId == null ? this.messages.subjects.messages.createError : this.messages.subjects.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      subjectId == null ? this.messages.subjects.messages.createSuccessTitle : this.messages.subjects.messages.updateSuccessTitle,
      this.messages.subjects.messages.saveSuccessDetail(response.description),
    );
    await Promise.all([this.loadSubjects(), this.loadBooks(), this.loadReport()]);
    return response;
  }

  async deleteSubject(subject: Subject): Promise<boolean> {
    if (!window.confirm(this.messages.subjects.confirmDelete(subject.description))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.api.deleteSubject(subject.id)),
      this.messages.subjects.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.subjects.messages.deleteSuccessTitle,
      this.messages.subjects.messages.deleteSuccessDetail(subject.description),
    );
    await Promise.all([this.loadSubjects(), this.loadBooks(), this.loadReport()]);
    return true;
  }

  async loadBooks(filters: Partial<BookFilters> = this.currentBookFilters()): Promise<void> {
    const normalizedFilters = this.normalizeBookFilters(filters);
    this.currentBookFilters.set(normalizedFilters);
    const response = await this.runRequest(
      () => firstValueFrom(this.api.listBooks(normalizedFilters)),
      this.messages.books.messages.loadError,
    );
    if (response) {
      this.books.set(response.items);
    }
  }

  async saveBook(bookId: number | null, payload: BookUpsertPayload): Promise<Book | undefined> {
    const response = await this.runRequest(
      () =>
        bookId == null
          ? firstValueFrom(this.api.createBook(payload))
          : firstValueFrom(this.api.updateBook(bookId, payload)),
      bookId == null ? this.messages.books.messages.createError : this.messages.books.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      bookId == null ? this.messages.books.messages.createSuccessTitle : this.messages.books.messages.updateSuccessTitle,
      this.messages.books.messages.saveSuccessDetail(response.title),
    );
    await Promise.all([this.loadBooks(), this.loadReport()]);
    return response;
  }

  async deleteBook(book: Book): Promise<boolean> {
    if (!window.confirm(this.messages.books.confirmDelete(book.title))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.api.deleteBook(book.id)),
      this.messages.books.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.books.messages.deleteSuccessTitle,
      this.messages.books.messages.deleteSuccessDetail(book.title),
    );
    await Promise.all([this.loadBooks(), this.loadReport()]);
    return true;
  }

  async loadReport(authorId = this.currentReportAuthorId()): Promise<void> {
    const normalizedAuthorId = authorId ?? null;
    this.currentReportAuthorId.set(normalizedAuthorId);
    const response = await this.runRequest(
      () => firstValueFrom(this.api.getBooksByAuthorReport(normalizedAuthorId)),
      this.messages.reports.messages.loadError,
    );
    if (response) {
      this.report.set(response);
    }
  }

  async downloadReport(authorId = this.currentReportAuthorId()): Promise<boolean> {
    const normalizedAuthorId = authorId ?? null;
    const blob = await this.runRequest(
      () => firstValueFrom(this.api.exportBooksByAuthorReport(normalizedAuthorId)),
      this.messages.reports.messages.exportError,
    );
    if (!blob) {
      return false;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.messages.reports.messages.exportFilename;
    link.click();
    window.URL.revokeObjectURL(url);
    this.showSuccess(this.messages.reports.messages.exportSuccessTitle, this.messages.reports.messages.exportSuccessDetail);
    return true;
  }

  private normalizeBookFilters(filters: Partial<BookFilters>): BookFilters {
    return {
      title: filters.title?.trim() ?? '',
      authorId: filters.authorId ?? null,
      subjectId: filters.subjectId ?? null,
    };
  }

  private async runRequest<T>(operation: () => Promise<T>, fallbackMessage: string): Promise<T | undefined> {
    this.pendingRequests.update((value) => value + 1);
    try {
      return await operation();
    } catch (error) {
      this.presentError(error, fallbackMessage);
      return undefined;
    } finally {
      this.pendingRequests.update((value) => Math.max(0, value - 1));
    }
  }

  private async runAction(operation: () => Promise<void>, fallbackMessage: string): Promise<boolean> {
    const result = await this.runRequest(async () => {
      await operation();
      return true;
    }, fallbackMessage);
    return result ?? false;
  }

  private presentError(error: unknown, fallbackMessage: string): void {
    const httpError = error as HttpErrorResponse;
    const problem = httpError.error as ProblemResponse | undefined;
    const fieldErrors = problem?.errors?.map((item) => item.message).join(' ');
    const detail = [problem?.detail, fieldErrors].filter(Boolean).join(' ') || fallbackMessage;

    this.flash.set({
      kind: 'error',
      title: problem?.title ?? this.messages.notifications.integrationFailureTitle,
      detail,
    });
  }

  private showSuccess(title: string, detail: string): void {
    this.flash.set({ kind: 'success', title, detail });
  }
}
