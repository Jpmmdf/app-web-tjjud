import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { Author } from '../../../core/models/catalog.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

@Component({
  selector: 'app-author-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './author-panel.component.html',
})
export class AuthorPanelComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.authors;
  protected readonly editingAuthorId = signal<number | null>(null);
  protected readonly authorSearchControl = this.fb.nonNullable.control(this.catalog.currentAuthorQuery());
  protected readonly authorForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
  });

  protected async loadAuthors(): Promise<void> {
    await this.catalog.loadAuthors(this.authorSearchControl.value);
  }

  protected async submitAuthor(): Promise<void> {
    if (this.authorForm.invalid) {
      this.authorForm.markAllAsTouched();
      return;
    }

    const result = await this.catalog.saveAuthor(this.editingAuthorId(), {
      name: this.authorForm.getRawValue().name.trim(),
    });
    if (result) {
      this.resetAuthorForm();
    }
  }

  protected editAuthor(author: Author): void {
    this.editingAuthorId.set(author.id);
    this.authorForm.reset({ name: author.name });
  }

  protected resetAuthorForm(): void {
    this.editingAuthorId.set(null);
    this.authorForm.reset({ name: '' });
  }

  protected async deleteAuthor(author: Author): Promise<void> {
    const deleted = await this.catalog.deleteAuthor(author);
    if (deleted && this.editingAuthorId() === author.id) {
      this.resetAuthorForm();
    }
  }
}
