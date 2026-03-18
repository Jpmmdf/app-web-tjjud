import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { Book, BookUpsertPayload } from '../../../core/models/catalog.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { BrlCurrencyMaskDirective } from '../../../shared/directives/brl-currency-mask.directive';
import { minimumSelectionValidator } from '../../../shared/forms/minimum-selection.validator';
import { joinAuthorNames, joinSubjectDescriptions } from '../../../shared/formatters/catalog-formatters';

@Component({
  selector: 'app-book-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BrlCurrencyMaskDirective],
  templateUrl: './book-panel.component.html',
})
export class BookPanelComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.books;
  protected readonly editingBookId = signal<number | null>(null);
  protected readonly bookFiltersForm = this.fb.group({
    title: this.fb.nonNullable.control(this.catalog.currentBookFilters().title),
    authorId: this.fb.control<number | null>(this.catalog.currentBookFilters().authorId),
    subjectId: this.fb.control<number | null>(this.catalog.currentBookFilters().subjectId),
  });
  protected readonly bookForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(40)]],
    publisher: ['', [Validators.required, Validators.maxLength(40)]],
    edition: [1, [Validators.required, Validators.min(1)]],
    publicationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(9999)]],
    price: ['', [Validators.required]],
    authorIds: this.fb.nonNullable.control<number[]>([], { validators: [minimumSelectionValidator(1)] }),
    subjectIds: this.fb.nonNullable.control<number[]>([], { validators: [minimumSelectionValidator(1)] }),
  });

  protected async loadBooks(): Promise<void> {
    await this.catalog.loadBooks(this.bookFiltersForm.getRawValue());
  }

  protected resetBookFilters(): void {
    this.bookFiltersForm.reset({ title: '', authorId: null, subjectId: null });
    void this.catalog.loadBooks({ title: '', authorId: null, subjectId: null });
  }

  protected async submitBook(): Promise<void> {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const rawValue = this.bookForm.getRawValue();
    const payload: BookUpsertPayload = {
      title: rawValue.title.trim(),
      publisher: rawValue.publisher.trim(),
      edition: rawValue.edition,
      publicationYear: rawValue.publicationYear,
      price: rawValue.price,
      authorIds: rawValue.authorIds,
      subjectIds: rawValue.subjectIds,
    };

    const result = await this.catalog.saveBook(this.editingBookId(), payload);
    if (result) {
      this.resetBookForm();
    }
  }

  protected editBook(book: Book): void {
    this.editingBookId.set(book.id);
    this.bookForm.reset({
      title: book.title,
      publisher: book.publisher,
      edition: book.edition,
      publicationYear: book.publicationYear,
      price: book.price,
      authorIds: book.authors.map((author) => author.id),
      subjectIds: book.subjects.map((subject) => subject.id),
    });
  }

  protected resetBookForm(): void {
    this.editingBookId.set(null);
    this.bookForm.reset({
      title: '',
      publisher: '',
      edition: 1,
      publicationYear: new Date().getFullYear(),
      price: '',
      authorIds: [],
      subjectIds: [],
    });
  }

  protected async deleteBook(book: Book): Promise<void> {
    const deleted = await this.catalog.deleteBook(book);
    if (deleted && this.editingBookId() === book.id) {
      this.resetBookForm();
    }
  }

  protected bookAuthors(book: Book): string {
    return joinAuthorNames(book.authors);
  }

  protected bookSubjects(book: Book): string {
    return joinSubjectDescriptions(book.subjects);
  }
}
