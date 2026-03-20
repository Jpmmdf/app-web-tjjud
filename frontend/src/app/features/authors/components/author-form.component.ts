import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthorsApiService } from '../../../core/api/authors-api.service';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { normalizeTextValue } from '../../../shared/formatters/text-normalizer';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './author-form.component.html',
  styleUrl: './author-form.component.scss',
})
export class AuthorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorsApi = inject(AuthorsApiService);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.authors;
  protected readonly editingAuthorId = signal<number | null>(null);
  protected readonly authorForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
  });

  async ngOnInit(): Promise<void> {
    const authorIdParam = this.route.snapshot.paramMap.get('authorId');
    if (!authorIdParam) {
      return;
    }
    const authorId = Number(authorIdParam);
    this.editingAuthorId.set(authorId);
    const author = await firstValueFrom(this.authorsApi.get(authorId));
    this.authorForm.reset({ name: author.name });
  }

  protected async submitAuthor(): Promise<void> {
    if (this.authorForm.invalid) {
      this.authorForm.markAllAsTouched();
      return;
    }

    const result = await this.catalog.saveAuthor(this.editingAuthorId(), {
      name: normalizeTextValue(this.authorForm.getRawValue().name),
    });
    if (result) {
      await this.router.navigate(['/autores']);
    }
  }
}
