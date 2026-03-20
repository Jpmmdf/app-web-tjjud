import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BooksApiService } from '../../../core/api/books-api.service';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import type { AuthorSummary } from '../../../core/models/authors.models';
import { BookUpsertPayload } from '../../../core/models/books.models';
import type { SubjectSummary } from '../../../core/models/subjects.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { BrlCurrencyMaskDirective } from '../../../shared/directives/brl-currency-mask.directive';
import { minimumSelectionValidator } from '../../../shared/forms/minimum-selection.validator';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, BrlCurrencyMaskDirective, RouterLink],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booksApi = inject(BooksApiService);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.books;
  protected readonly editingBookId = signal<number | null>(null);
  protected readonly authorSearch = signal('');
  protected readonly subjectSearch = signal('');
  protected readonly bookForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(40)]],
    publisher: ['', [Validators.required, Validators.maxLength(40)]],
    edition: [1, [Validators.required, Validators.min(1)]],
    publicationYear: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(9999)]],
    price: ['', [Validators.required]],
    authorIds: this.fb.nonNullable.control<number[]>([], { validators: [minimumSelectionValidator(1)] }),
    subjectIds: this.fb.nonNullable.control<number[]>([], { validators: [minimumSelectionValidator(1)] }),
  });

  async ngOnInit(): Promise<void> {
    await this.catalog.loadReferenceOptions();
    const bookIdParam = this.route.snapshot.paramMap.get('bookId');
    if (!bookIdParam) {
      return;
    }
    const bookId = Number(bookIdParam);
    this.editingBookId.set(bookId);
    const book = await firstValueFrom(this.booksApi.get(bookId));
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

  protected async submitBook(): Promise<void> {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const rawValue = this.bookForm.getRawValue();
    const payload: BookUpsertPayload = {
      title: this.normalizeTextValue(rawValue.title),
      publisher: this.normalizeTextValue(rawValue.publisher),
      edition: rawValue.edition,
      publicationYear: rawValue.publicationYear,
      price: rawValue.price,
      authorIds: rawValue.authorIds,
      subjectIds: rawValue.subjectIds,
    };

    const result = await this.catalog.saveBook(this.editingBookId(), payload);
    if (result) {
      await this.router.navigate(['/livros']);
    }
  }

  protected setAuthorSearch(term: string): void {
    this.authorSearch.set(term);
  }

  protected setSubjectSearch(term: string): void {
    this.subjectSearch.set(term);
  }

  protected filteredAuthors(): AuthorSummary[] {
    return this.filterOptions(this.catalog.authorOptions(), this.authorSearch(), (author) => author.name);
  }

  protected filteredSubjects(): SubjectSummary[] {
    return this.filterOptions(this.catalog.subjectOptions(), this.subjectSearch(), (subject) => subject.description);
  }

  protected selectedAuthors(): AuthorSummary[] {
    return this.resolveSelectedOptions(this.catalog.authorOptions(), this.bookForm.controls.authorIds.value);
  }

  protected selectedSubjects(): SubjectSummary[] {
    return this.resolveSelectedOptions(this.catalog.subjectOptions(), this.bookForm.controls.subjectIds.value);
  }

  protected isAuthorSelected(authorId: number): boolean {
    return this.bookForm.controls.authorIds.value.includes(authorId);
  }

  protected isSubjectSelected(subjectId: number): boolean {
    return this.bookForm.controls.subjectIds.value.includes(subjectId);
  }

  protected toggleAuthor(authorId: number, checked: boolean): void {
    this.updateSelection(this.bookForm.controls.authorIds, authorId, checked);
  }

  protected toggleSubject(subjectId: number, checked: boolean): void {
    this.updateSelection(this.bookForm.controls.subjectIds, subjectId, checked);
  }

  protected removeAuthor(authorId: number): void {
    this.updateSelection(this.bookForm.controls.authorIds, authorId, false);
  }

  protected removeSubject(subjectId: number): void {
    this.updateSelection(this.bookForm.controls.subjectIds, subjectId, false);
  }

  protected hasSelectionError(controlName: 'authorIds' | 'subjectIds'): boolean {
    const control = this.bookForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private filterOptions<T>(options: readonly T[], term: string, label: (option: T) => string): T[] {
    const normalizedTerm = this.normalizeTerm(term);
    if (!normalizedTerm) {
      return [...options];
    }
    return options.filter((option) => this.normalizeTerm(label(option)).includes(normalizedTerm));
  }

  private resolveSelectedOptions<T extends { id: number }>(options: readonly T[], selectedIds: readonly number[]): T[] {
    const selected = new Set(selectedIds);
    return options.filter((option) => selected.has(option.id));
  }

  private updateSelection(control: FormControl<number[]>, optionId: number, checked: boolean): void {
    const current = control.value;
    const isSelected = current.includes(optionId);

    if (checked && !isSelected) {
      control.setValue([...current, optionId]);
    }

    if (!checked && isSelected) {
      control.setValue(current.filter((id) => id !== optionId));
    }

    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  private normalizeTerm(value: string): string {
    return this.normalizeTextValue(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private normalizeTextValue(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}
