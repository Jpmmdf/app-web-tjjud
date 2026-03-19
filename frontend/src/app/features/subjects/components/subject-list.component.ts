import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { SortDirection } from '../../../core/models/common.models';
import { Subject } from '../../../core/models/subjects.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.scss',
})
export class SubjectListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.subjects;
  protected readonly subjectSearchControl = this.fb.nonNullable.control(this.catalog.currentSubjectList().query);
  protected readonly sortControl = this.fb.nonNullable.control<SubjectSortOption>(this.toSortOption(
    this.catalog.currentSubjectList().sortField,
    this.catalog.currentSubjectList().sortDirection,
  ));

  async ngOnInit(): Promise<void> {
    await this.loadSubjects();
  }

  protected async loadSubjects(): Promise<void> {
    await this.catalog.loadSubjects({
      query: this.subjectSearchControl.value,
      page: 0,
      ...this.fromSortOption(this.sortControl.value),
    });
  }

  protected async deleteSubject(subject: Subject): Promise<void> {
    await this.catalog.deleteSubject(subject);
  }

  protected async goToPage(page: number): Promise<void> {
    await this.catalog.loadSubjects({ page });
  }

  protected async sortBy(field: 'id' | 'description'): Promise<void> {
    const nextOption = this.nextSortOption(field);
    this.sortControl.setValue(nextOption);
    await this.catalog.loadSubjects({
      query: this.subjectSearchControl.value,
      page: 0,
      ...this.fromSortOption(nextOption),
    });
  }

  protected sortIndicator(field: 'id' | 'description'): string {
    const current = this.sortControl.value;
    if ((field === 'id' && current === 'idAsc') || (field === 'description' && current === 'descriptionAsc')) {
      return '↑';
    }
    if ((field === 'id' && current === 'idDesc') || (field === 'description' && current === 'descriptionDesc')) {
      return '↓';
    }
    return '';
  }

  protected hasPreviousPage(): boolean {
    return this.catalog.subjectPage().page > 0;
  }

  protected hasNextPage(): boolean {
    return this.catalog.subjectPage().page + 1 < this.catalog.subjectPage().totalPages;
  }

  private fromSortOption(option: SubjectSortOption): { sortField: string; sortDirection: SortDirection } {
    switch (option) {
      case 'descriptionDesc':
        return { sortField: 'description', sortDirection: 'DESC' };
      case 'idAsc':
        return { sortField: 'id', sortDirection: 'ASC' };
      case 'idDesc':
        return { sortField: 'id', sortDirection: 'DESC' };
      case 'descriptionAsc':
      default:
        return { sortField: 'description', sortDirection: 'ASC' };
    }
  }

  private toSortOption(field: string, direction: SortDirection): SubjectSortOption {
    if (field === 'id') {
      return direction === 'DESC' ? 'idDesc' : 'idAsc';
    }
    return direction === 'DESC' ? 'descriptionDesc' : 'descriptionAsc';
  }

  private nextSortOption(field: 'id' | 'description'): SubjectSortOption {
    const current = this.sortControl.value;
    if (field === 'id') {
      return current === 'idAsc' ? 'idDesc' : 'idAsc';
    }
    return current === 'descriptionAsc' ? 'descriptionDesc' : 'descriptionAsc';
  }
}

type SubjectSortOption = 'descriptionAsc' | 'descriptionDesc' | 'idAsc' | 'idDesc';
