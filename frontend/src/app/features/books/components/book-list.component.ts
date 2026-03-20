import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import type { AuthorSummary } from '../../../core/models/authors.models';
import { Book } from '../../../core/models/books.models';
import { SortDirection } from '../../../core/models/common.models';
import type { SubjectSummary } from '../../../core/models/subjects.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { formatCurrencyValue, joinAuthorNames, joinSubjectDescriptions } from '../../../shared/formatters/catalog-formatters';
import { normalizeTextValue } from '../../../shared/formatters/text-normalizer';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.books;
  protected readonly authorMatches = signal<AuthorSummary[]>([]);
  protected readonly subjectMatches = signal<SubjectSummary[]>([]);
  protected readonly selectedAuthor = signal<AuthorSummary | null>(null);
  protected readonly selectedSubject = signal<SubjectSummary | null>(null);
  protected readonly authorLookupBusy = signal(false);
  protected readonly subjectLookupBusy = signal(false);
  protected readonly authorLookupTouched = signal(false);
  protected readonly subjectLookupTouched = signal(false);
  protected readonly sortControl = this.fb.nonNullable.control<BookSortOption>(this.toSortOption(
    this.catalog.currentBookList().sortField,
    this.catalog.currentBookList().sortDirection,
  ));
  protected readonly bookFiltersForm = this.fb.group({
    title: this.fb.nonNullable.control(this.catalog.currentBookList().title),
    authorId: this.fb.control<number | null>(this.catalog.currentBookList().authorId),
    subjectId: this.fb.control<number | null>(this.catalog.currentBookList().subjectId),
    authorQuery: this.fb.nonNullable.control(''),
    subjectQuery: this.fb.nonNullable.control(''),
  });

  async ngOnInit(): Promise<void> {
    await this.restoreSelectedFilters();
    await this.loadBooks();
  }

  protected async loadBooks(): Promise<void> {
    await this.catalog.loadBooks({
      ...this.currentBookFilters(),
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected resetBookFilters(): void {
    this.bookFiltersForm.reset({ title: '', authorId: null, subjectId: null, authorQuery: '', subjectQuery: '' });
    this.authorMatches.set([]);
    this.subjectMatches.set([]);
    this.selectedAuthor.set(null);
    this.selectedSubject.set(null);
    this.authorLookupTouched.set(false);
    this.subjectLookupTouched.set(false);
    void this.catalog.loadBooks({
      title: '',
      authorId: null,
      subjectId: null,
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected async deleteBook(book: Book): Promise<void> {
    await this.catalog.deleteBook(book);
  }

  protected async goToPage(page: number): Promise<void> {
    await this.catalog.loadBooks({ page });
  }

  protected async sortBy(field: 'title' | 'publicationYear' | 'price'): Promise<void> {
    const nextOption = this.nextSortOption(field);
    this.sortControl.setValue(nextOption);
    await this.catalog.loadBooks({
      ...this.currentBookFilters(),
      page: 0,
      ...this.fromSortOption(nextOption),
    });
  }

  protected async searchAuthors(): Promise<void> {
    if (this.authorLookupBusy()) {
      return;
    }

    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.authorQuery.value);
    this.authorLookupTouched.set(true);
    this.bookFiltersForm.controls.authorQuery.setValue(query, { emitEvent: false });

    if (query.length < 2) {
      this.authorMatches.set([]);
      return;
    }

    this.authorMatches.set([]);
    this.authorLookupBusy.set(true);
    try {
      const results = await this.catalog.searchAuthorOptions(query);
      if (this.normalizeLookupQuery(this.bookFiltersForm.controls.authorQuery.value) === query) {
        this.authorMatches.set(results);
      }
    } finally {
      this.authorLookupBusy.set(false);
    }
  }

  protected async searchSubjects(): Promise<void> {
    if (this.subjectLookupBusy()) {
      return;
    }

    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.subjectQuery.value);
    this.subjectLookupTouched.set(true);
    this.bookFiltersForm.controls.subjectQuery.setValue(query, { emitEvent: false });

    if (query.length < 2) {
      this.subjectMatches.set([]);
      return;
    }

    this.subjectMatches.set([]);
    this.subjectLookupBusy.set(true);
    try {
      const results = await this.catalog.searchSubjectOptions(query);
      if (this.normalizeLookupQuery(this.bookFiltersForm.controls.subjectQuery.value) === query) {
        this.subjectMatches.set(results);
      }
    } finally {
      this.subjectLookupBusy.set(false);
    }
  }

  protected selectAuthorFilter(author: AuthorSummary): void {
    this.bookFiltersForm.controls.authorId.setValue(author.id);
    this.bookFiltersForm.controls.authorQuery.setValue('');
    this.selectedAuthor.set(author);
    this.authorMatches.set([]);
    this.authorLookupTouched.set(false);
  }

  protected selectSubjectFilter(subject: SubjectSummary): void {
    this.bookFiltersForm.controls.subjectId.setValue(subject.id);
    this.bookFiltersForm.controls.subjectQuery.setValue('');
    this.selectedSubject.set(subject);
    this.subjectMatches.set([]);
    this.subjectLookupTouched.set(false);
  }

  protected clearAuthorSelection(): void {
    this.bookFiltersForm.controls.authorId.setValue(null);
    this.bookFiltersForm.controls.authorQuery.setValue('');
    this.selectedAuthor.set(null);
    this.authorMatches.set([]);
    this.authorLookupTouched.set(false);
  }

  protected clearSubjectSelection(): void {
    this.bookFiltersForm.controls.subjectId.setValue(null);
    this.bookFiltersForm.controls.subjectQuery.setValue('');
    this.selectedSubject.set(null);
    this.subjectMatches.set([]);
    this.subjectLookupTouched.set(false);
  }

  protected showAuthorTooShort(): boolean {
    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.authorQuery.value);
    return this.authorLookupTouched() && query.length > 0 && query.length < 2;
  }

  protected showSubjectTooShort(): boolean {
    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.subjectQuery.value);
    return this.subjectLookupTouched() && query.length > 0 && query.length < 2;
  }

  protected showEmptyAuthorSearch(): boolean {
    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.authorQuery.value);
    return this.authorLookupTouched() && !this.authorLookupBusy() && query.length >= 2 && this.authorMatches().length === 0;
  }

  protected showEmptySubjectSearch(): boolean {
    const query = this.normalizeLookupQuery(this.bookFiltersForm.controls.subjectQuery.value);
    return this.subjectLookupTouched() && !this.subjectLookupBusy() && query.length >= 2 && this.subjectMatches().length === 0;
  }

  protected bookAuthors(book: Book): string {
    return joinAuthorNames(book.authors);
  }

  protected bookSubjects(book: Book): string {
    return joinSubjectDescriptions(book.subjects);
  }

  protected bookPrice(book: Book): string {
    return formatCurrencyValue(book.price);
  }

  protected hasPreviousPage(): boolean {
    return this.catalog.bookPage().page > 0;
  }

  protected hasNextPage(): boolean {
    return this.catalog.bookPage().page + 1 < this.catalog.bookPage().totalPages;
  }

  protected sortIndicator(field: 'title' | 'publicationYear' | 'price'): string {
    const current = this.sortControl.value;
    if (
      (field === 'title' && current === 'titleAsc') ||
      (field === 'publicationYear' && current === 'yearAsc') ||
      (field === 'price' && current === 'priceAsc')
    ) {
      return '↑';
    }
    if (
      (field === 'title' && current === 'titleDesc') ||
      (field === 'publicationYear' && current === 'yearDesc') ||
      (field === 'price' && current === 'priceDesc')
    ) {
      return '↓';
    }
    return '';
  }

  private fromSortOption(option: BookSortOption): { sortField: string; sortDirection: SortDirection } {
    switch (option) {
      case 'titleDesc':
        return { sortField: 'title', sortDirection: 'DESC' };
      case 'yearDesc':
        return { sortField: 'publicationYear', sortDirection: 'DESC' };
      case 'yearAsc':
        return { sortField: 'publicationYear', sortDirection: 'ASC' };
      case 'priceDesc':
        return { sortField: 'price', sortDirection: 'DESC' };
      case 'priceAsc':
        return { sortField: 'price', sortDirection: 'ASC' };
      case 'titleAsc':
      default:
        return { sortField: 'title', sortDirection: 'ASC' };
    }
  }

  private toSortOption(field: string, direction: SortDirection): BookSortOption {
    if (field === 'publicationYear') {
      return direction === 'DESC' ? 'yearDesc' : 'yearAsc';
    }
    if (field === 'price') {
      return direction === 'DESC' ? 'priceDesc' : 'priceAsc';
    }
    return direction === 'DESC' ? 'titleDesc' : 'titleAsc';
  }

  private nextSortOption(field: 'title' | 'publicationYear' | 'price'): BookSortOption {
    const current = this.sortControl.value;
    if (field === 'publicationYear') {
      return current === 'yearAsc' ? 'yearDesc' : 'yearAsc';
    }
    if (field === 'price') {
      return current === 'priceAsc' ? 'priceDesc' : 'priceAsc';
    }
    return current === 'titleAsc' ? 'titleDesc' : 'titleAsc';
  }

  private currentBookFilters(): { title: string; authorId: number | null; subjectId: number | null } {
    const { title, authorId, subjectId } = this.bookFiltersForm.getRawValue();
    return { title, authorId, subjectId };
  }

  private normalizeLookupQuery(value: string): string {
    return normalizeTextValue(value);
  }

  private async restoreSelectedFilters(): Promise<void> {
    const authorId = this.bookFiltersForm.controls.authorId.value;
    const subjectId = this.bookFiltersForm.controls.subjectId.value;

    if (authorId !== null) {
      const cachedAuthor = this.catalog.authorOptions().find((author) => author.id === authorId);
      this.selectedAuthor.set(cachedAuthor ?? (await this.catalog.getAuthorOption(authorId)) ?? null);
    }

    if (subjectId !== null) {
      const cachedSubject = this.catalog.subjectOptions().find((subject) => subject.id === subjectId);
      this.selectedSubject.set(cachedSubject ?? (await this.catalog.getSubjectOption(subjectId)) ?? null);
    }
  }
}

type BookSortOption = 'titleAsc' | 'titleDesc' | 'yearDesc' | 'yearAsc' | 'priceDesc' | 'priceAsc';
