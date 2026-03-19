import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BooksApiService } from '../../../core/api/books-api.service';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { BookUpsertPayload } from '../../../core/models/books.models';
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
      await this.router.navigate(['/livros']);
    }
  }
}
