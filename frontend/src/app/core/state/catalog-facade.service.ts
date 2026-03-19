import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthorListRequest, AuthorsApiService } from '../api/authors-api.service';
import { BookListRequest, BooksApiService } from '../api/books-api.service';
import { ReportListRequest, ReportsApiService } from '../api/reports-api.service';
import { SubjectListRequest, SubjectsApiService } from '../api/subjects-api.service';
import { ptBrCatalogMessages } from '../i18n/pt-br';
import { Author } from '../models/authors.models';
import { Book, BookUpsertPayload } from '../models/books.models';
import { PageMetadata, ProblemResponse, SortDirection } from '../models/common.models';
import { AuthorBookReport } from '../models/reports.models';
import { Subject } from '../models/subjects.models';

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

interface ListState {
  page: number;
  size: number;
  sortField: string;
  sortDirection: SortDirection;
}

interface AuthorListState extends ListState {
  query: string;
}

interface SubjectListState extends ListState {
  query: string;
}

interface BookListState extends ListState, BookFilters {}

interface ReportListState extends ListState {
  authorId: number | null;
}

interface OverviewStats {
  authors: number;
  subjects: number;
  books: number;
}

const DEFAULT_PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class CatalogFacadeService {
  private readonly authorsApi = inject(AuthorsApiService);
  private readonly subjectsApi = inject(SubjectsApiService);
  private readonly booksApi = inject(BooksApiService);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly messages = ptBrCatalogMessages;

  readonly loading = signal(true);
  readonly pendingRequests = signal(0);
  readonly flash = signal<FlashMessage | null>(null);

  readonly authors = signal<Author[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly books = signal<Book[]>([]);
  readonly report = signal<AuthorBookReport | null>(null);
  readonly authorOptions = signal<Author[]>([]);
  readonly subjectOptions = signal<Subject[]>([]);
  readonly overviewStats = signal<OverviewStats>(emptyOverviewStats());

  readonly authorPage = signal<PageMetadata>(emptyPageMetadata(DEFAULT_PAGE_SIZE));
  readonly subjectPage = signal<PageMetadata>(emptyPageMetadata(DEFAULT_PAGE_SIZE));
  readonly bookPage = signal<PageMetadata>(emptyPageMetadata(DEFAULT_PAGE_SIZE));
  readonly reportPage = signal<PageMetadata>(emptyPageMetadata(DEFAULT_PAGE_SIZE));

  readonly currentAuthorList = signal<AuthorListState>({
    query: '',
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'name',
    sortDirection: 'ASC',
  });
  readonly currentSubjectList = signal<SubjectListState>({
    query: '',
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'description',
    sortDirection: 'ASC',
  });
  readonly currentBookList = signal<BookListState>({
    title: '',
    authorId: null,
    subjectId: null,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'title',
    sortDirection: 'ASC',
  });
  readonly currentReportList = signal<ReportListState>({
    authorId: null,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    sortField: 'authorName',
    sortDirection: 'ASC',
  });

  readonly isBusy = computed(() => this.pendingRequests() > 0);
  readonly authorCount = computed(() => this.overviewStats().authors);
  readonly subjectCount = computed(() => this.overviewStats().subjects);
  readonly bookCount = computed(() => this.overviewStats().books);
  readonly reportGroupCount = computed(() => this.reportPage().totalElements);

  async refreshAll(): Promise<void> {
    this.loading.set(true);
    await Promise.all([
      this.loadAuthors(),
      this.loadSubjects(),
      this.loadBooks(),
      this.loadReport(),
      this.loadReferenceOptions(),
      this.loadOverviewStats(),
    ]);
    this.loading.set(false);
  }

  clearFlash(): void {
    this.flash.set(null);
  }

  async loadAuthors(partial: Partial<AuthorListState> = {}): Promise<void> {
    const request = { ...this.currentAuthorList(), ...partial };
    this.currentAuthorList.set(request);
    const response = await this.runRequest(
      () => firstValueFrom(this.authorsApi.list(request)),
      this.messages.authors.messages.loadError,
    );
    if (response) {
      this.authors.set(response.items);
      this.authorPage.set(response.page);
    }
  }

  async saveAuthor(authorId: number | null, payload: Pick<Author, 'name'>): Promise<Author | undefined> {
    const response = await this.runRequest(
      () =>
        authorId == null
          ? firstValueFrom(this.authorsApi.create(payload))
          : firstValueFrom(this.authorsApi.update(authorId, payload)),
      authorId == null ? this.messages.authors.messages.createError : this.messages.authors.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      authorId == null ? this.messages.authors.messages.createSuccessTitle : this.messages.authors.messages.updateSuccessTitle,
      this.messages.authors.messages.saveSuccessDetail(response.name),
    );
    await Promise.all([this.loadAuthors(), this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return response;
  }

  async deleteAuthor(author: Author): Promise<boolean> {
    if (!window.confirm(this.messages.authors.confirmDelete(author.name))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.authorsApi.delete(author.id)),
      this.messages.authors.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.authors.messages.deleteSuccessTitle,
      this.messages.authors.messages.deleteSuccessDetail(author.name),
    );
    await Promise.all([this.loadAuthors(), this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return true;
  }

  async loadSubjects(partial: Partial<SubjectListState> = {}): Promise<void> {
    const request = { ...this.currentSubjectList(), ...partial };
    this.currentSubjectList.set(request);
    const response = await this.runRequest(
      () => firstValueFrom(this.subjectsApi.list(request)),
      this.messages.subjects.messages.loadError,
    );
    if (response) {
      this.subjects.set(response.items);
      this.subjectPage.set(response.page);
    }
  }

  async saveSubject(subjectId: number | null, payload: Pick<Subject, 'description'>): Promise<Subject | undefined> {
    const response = await this.runRequest(
      () =>
        subjectId == null
          ? firstValueFrom(this.subjectsApi.create(payload))
          : firstValueFrom(this.subjectsApi.update(subjectId, payload)),
      subjectId == null ? this.messages.subjects.messages.createError : this.messages.subjects.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      subjectId == null ? this.messages.subjects.messages.createSuccessTitle : this.messages.subjects.messages.updateSuccessTitle,
      this.messages.subjects.messages.saveSuccessDetail(response.description),
    );
    await Promise.all([this.loadSubjects(), this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return response;
  }

  async deleteSubject(subject: Subject): Promise<boolean> {
    if (!window.confirm(this.messages.subjects.confirmDelete(subject.description))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.subjectsApi.delete(subject.id)),
      this.messages.subjects.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.subjects.messages.deleteSuccessTitle,
      this.messages.subjects.messages.deleteSuccessDetail(subject.description),
    );
    await Promise.all([this.loadSubjects(), this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return true;
  }

  async loadBooks(partial: Partial<BookListState> = {}): Promise<void> {
    const request = this.normalizeBookList({ ...this.currentBookList(), ...partial });
    this.currentBookList.set(request);
    const response = await this.runRequest(
      () => firstValueFrom(this.booksApi.list(request)),
      this.messages.books.messages.loadError,
    );
    if (response) {
      this.books.set(response.items);
      this.bookPage.set(response.page);
    }
  }

  async saveBook(bookId: number | null, payload: BookUpsertPayload): Promise<Book | undefined> {
    const response = await this.runRequest(
      () =>
        bookId == null
          ? firstValueFrom(this.booksApi.create(payload))
          : firstValueFrom(this.booksApi.update(bookId, payload)),
      bookId == null ? this.messages.books.messages.createError : this.messages.books.messages.updateError,
    );
    if (!response) {
      return undefined;
    }

    this.showSuccess(
      bookId == null ? this.messages.books.messages.createSuccessTitle : this.messages.books.messages.updateSuccessTitle,
      this.messages.books.messages.saveSuccessDetail(response.title),
    );
    await Promise.all([this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return response;
  }

  async deleteBook(book: Book): Promise<boolean> {
    if (!window.confirm(this.messages.books.confirmDelete(book.title))) {
      return false;
    }

    const deleted = await this.runAction(
      () => firstValueFrom(this.booksApi.delete(book.id)),
      this.messages.books.messages.deleteError,
    );
    if (!deleted) {
      return false;
    }

    this.showSuccess(
      this.messages.books.messages.deleteSuccessTitle,
      this.messages.books.messages.deleteSuccessDetail(book.title),
    );
    await Promise.all([this.loadBooks(), this.loadReport(), this.loadOverviewStats()]);
    return true;
  }

  async loadReport(partial: Partial<ReportListState> = {}): Promise<void> {
    const request = { ...this.currentReportList(), ...partial };
    this.currentReportList.set(request);
    const response = await this.runRequest(
      () => firstValueFrom(this.reportsApi.getBooksByAuthorReport(request)),
      this.messages.reports.messages.loadError,
    );
    if (response) {
      this.report.set(response);
      this.reportPage.set(response.page);
    }
  }

  async loadReferenceOptions(): Promise<void> {
    const [authors, subjects] = await Promise.all([
      this.runRequest(
        () =>
          firstValueFrom(
            this.authorsApi.list({
              query: '',
              page: 0,
              size: 100,
              sortField: 'name',
              sortDirection: 'ASC',
            }),
          ),
        this.messages.authors.messages.loadError,
      ),
      this.runRequest(
        () =>
          firstValueFrom(
            this.subjectsApi.list({
              query: '',
              page: 0,
              size: 100,
              sortField: 'description',
              sortDirection: 'ASC',
            }),
          ),
        this.messages.subjects.messages.loadError,
      ),
    ]);

    if (authors) {
      this.authorOptions.set(authors.items);
    }
    if (subjects) {
      this.subjectOptions.set(subjects.items);
    }
  }

  async searchAuthorOptions(query: string, size = 10): Promise<Author[]> {
    const response = await this.runRequest(
      () =>
        firstValueFrom(
          this.authorsApi.list({
            query,
            page: 0,
            size,
            sortField: 'name',
            sortDirection: 'ASC',
          }),
        ),
      this.messages.authors.messages.loadError,
    );
    return response?.items ?? [];
  }

  async searchSubjectOptions(query: string, size = 10): Promise<Subject[]> {
    const response = await this.runRequest(
      () =>
        firstValueFrom(
          this.subjectsApi.list({
            query,
            page: 0,
            size,
            sortField: 'description',
            sortDirection: 'ASC',
          }),
        ),
      this.messages.subjects.messages.loadError,
    );
    return response?.items ?? [];
  }

  async getAuthorOption(authorId: number): Promise<Author | undefined> {
    return this.runRequest(() => firstValueFrom(this.authorsApi.get(authorId)), this.messages.authors.messages.loadError);
  }

  async getSubjectOption(subjectId: number): Promise<Subject | undefined> {
    return this.runRequest(() => firstValueFrom(this.subjectsApi.get(subjectId)), this.messages.subjects.messages.loadError);
  }

  async loadOverviewStats(): Promise<void> {
    const [authors, subjects, books] = await Promise.all([
      this.runRequest(
        () =>
          firstValueFrom(
            this.authorsApi.list({
              query: '',
              page: 0,
              size: 1,
              sortField: 'name',
              sortDirection: 'ASC',
            }),
          ),
        this.messages.authors.messages.loadError,
      ),
      this.runRequest(
        () =>
          firstValueFrom(
            this.subjectsApi.list({
              query: '',
              page: 0,
              size: 1,
              sortField: 'description',
              sortDirection: 'ASC',
            }),
          ),
        this.messages.subjects.messages.loadError,
      ),
      this.runRequest(
        () =>
          firstValueFrom(
            this.booksApi.list({
              title: '',
              authorId: null,
              subjectId: null,
              page: 0,
              size: 1,
              sortField: 'title',
              sortDirection: 'ASC',
            }),
          ),
        this.messages.books.messages.loadError,
      ),
    ]);

    this.overviewStats.set({
      authors: authors?.page.totalElements ?? this.overviewStats().authors,
      subjects: subjects?.page.totalElements ?? this.overviewStats().subjects,
      books: books?.page.totalElements ?? this.overviewStats().books,
    });
  }

  async downloadReport(authorId = this.currentReportList().authorId): Promise<boolean> {
    const normalizedAuthorId = authorId ?? null;
    const response = await this.runRequest(
      () => firstValueFrom(this.reportsApi.exportBooksByAuthorReport(normalizedAuthorId)),
      this.messages.reports.messages.exportError,
    );
    if (!response?.body) {
      return false;
    }

    const url = window.URL.createObjectURL(response.body);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.extractFilename(response.headers.get('content-disposition'));
    link.click();
    window.URL.revokeObjectURL(url);
    this.showSuccess(this.messages.reports.messages.exportSuccessTitle, this.messages.reports.messages.exportSuccessDetail);
    return true;
  }

  private extractFilename(contentDisposition: string | null): string {
    if (!contentDisposition) {
      return this.messages.reports.messages.exportFilename;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return filenameMatch?.[1] ?? this.messages.reports.messages.exportFilename;
  }

  private normalizeBookList(filters: BookListState): BookListState {
    return {
      ...filters,
      title: filters.title.trim(),
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

function emptyPageMetadata(size: number): PageMetadata {
  return {
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
  };
}

function emptyOverviewStats(): OverviewStats {
  return {
    authors: 0,
    subjects: 0,
    books: 0,
  };
}
