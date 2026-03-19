import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { Author } from '../../../core/models/authors.models';
import { SortDirection } from '../../../core/models/common.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.scss',
})
export class AuthorListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.authors;
  protected readonly authorSearchControl = this.fb.nonNullable.control(this.catalog.currentAuthorList().query);
  protected readonly sortControl = this.fb.nonNullable.control<AuthorSortOption>(this.toSortOption(
    this.catalog.currentAuthorList().sortField,
    this.catalog.currentAuthorList().sortDirection,
  ));

  async ngOnInit(): Promise<void> {
    await this.loadAuthors();
  }

  protected async loadAuthors(): Promise<void> {
    await this.catalog.loadAuthors({
      query: this.authorSearchControl.value,
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected async deleteAuthor(author: Author): Promise<void> {
    await this.catalog.deleteAuthor(author);
  }

  protected async goToPage(page: number): Promise<void> {
    await this.catalog.loadAuthors({ page });
  }

  protected async sortBy(field: 'id' | 'name'): Promise<void> {
    const nextOption = this.nextSortOption(field);
    this.sortControl.setValue(nextOption);
    await this.catalog.loadAuthors({
      query: this.authorSearchControl.value,
      page: 0,
      ...this.fromSortOption(nextOption),
    });
  }

  protected sortIndicator(field: 'id' | 'name'): string {
    const current = this.sortControl.value;
    if ((field === 'id' && current === 'idAsc') || (field === 'name' && current === 'nameAsc')) {
      return '↑';
    }
    if ((field === 'id' && current === 'idDesc') || (field === 'name' && current === 'nameDesc')) {
      return '↓';
    }
    return '';
  }

  protected hasPreviousPage(): boolean {
    return this.catalog.authorPage().page > 0;
  }

  protected hasNextPage(): boolean {
    return this.catalog.authorPage().page + 1 < this.catalog.authorPage().totalPages;
  }

  private fromSortOption(option: AuthorSortOption): { sortField: string; sortDirection: SortDirection } {
    switch (option) {
      case 'nameDesc':
        return { sortField: 'name', sortDirection: 'DESC' };
      case 'idAsc':
        return { sortField: 'id', sortDirection: 'ASC' };
      case 'idDesc':
        return { sortField: 'id', sortDirection: 'DESC' };
      case 'nameAsc':
      default:
        return { sortField: 'name', sortDirection: 'ASC' };
    }
  }

  private toSortOption(field: string, direction: SortDirection): AuthorSortOption {
    if (field === 'id') {
      return direction === 'DESC' ? 'idDesc' : 'idAsc';
    }
    return direction === 'DESC' ? 'nameDesc' : 'nameAsc';
  }

  private nextSortOption(field: 'id' | 'name'): AuthorSortOption {
    const current = this.sortControl.value;
    if (field === 'id') {
      return current === 'idAsc' ? 'idDesc' : 'idAsc';
    }
    return current === 'nameAsc' ? 'nameDesc' : 'nameAsc';
  }
}

type AuthorSortOption = 'nameAsc' | 'nameDesc' | 'idAsc' | 'idDesc';
