import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { Book } from '../../../core/models/books.models';
import { SortDirection } from '../../../core/models/common.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { joinAuthorNames, joinSubjectDescriptions } from '../../../shared/formatters/catalog-formatters';

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
  protected readonly sortControl = this.fb.nonNullable.control<BookSortOption>(this.toSortOption(
    this.catalog.currentBookList().sortField,
    this.catalog.currentBookList().sortDirection,
  ));
  protected readonly bookFiltersForm = this.fb.group({
    title: this.fb.nonNullable.control(this.catalog.currentBookList().title),
    authorId: this.fb.control<number | null>(this.catalog.currentBookList().authorId),
    subjectId: this.fb.control<number | null>(this.catalog.currentBookList().subjectId),
  });

  async ngOnInit(): Promise<void> {
    await this.loadBooks();
  }

  protected async loadBooks(): Promise<void> {
    await this.catalog.loadBooks({
      ...this.bookFiltersForm.getRawValue(),
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected resetBookFilters(): void {
    this.bookFiltersForm.reset({ title: '', authorId: null, subjectId: null });
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

  protected bookAuthors(book: Book): string {
    return joinAuthorNames(book.authors);
  }

  protected bookSubjects(book: Book): string {
    return joinSubjectDescriptions(book.subjects);
  }

  protected hasPreviousPage(): boolean {
    return this.catalog.bookPage().page > 0;
  }

  protected hasNextPage(): boolean {
    return this.catalog.bookPage().page + 1 < this.catalog.bookPage().totalPages;
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
}

type BookSortOption = 'titleAsc' | 'titleDesc' | 'yearDesc' | 'yearAsc' | 'priceDesc' | 'priceAsc';
