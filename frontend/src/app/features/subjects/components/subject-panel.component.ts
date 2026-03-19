
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { Subject } from '../../../core/models/catalog.models';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

@Component({
  selector: 'app-subject-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './subject-panel.component.html',
  styleUrl: './subject-panel.component.scss',
})
export class SubjectPanelComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.subjects;
  protected readonly editingSubjectId = signal<number | null>(null);
  protected readonly subjectSearchControl = this.fb.nonNullable.control(this.catalog.currentSubjectQuery());
  protected readonly subjectForm = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(20)]],
  });

  protected async loadSubjects(): Promise<void> {
    await this.catalog.loadSubjects(this.subjectSearchControl.value);
  }

  protected async submitSubject(): Promise<void> {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const result = await this.catalog.saveSubject(this.editingSubjectId(), {
      description: this.subjectForm.getRawValue().description.trim(),
    });
    if (result) {
      this.resetSubjectForm();
    }
  }

  protected editSubject(subject: Subject): void {
    this.editingSubjectId.set(subject.id);
    this.subjectForm.reset({ description: subject.description });
  }

  protected resetSubjectForm(): void {
    this.editingSubjectId.set(null);
    this.subjectForm.reset({ description: '' });
  }

  protected async deleteSubject(subject: Subject): Promise<void> {
    const deleted = await this.catalog.deleteSubject(subject);
    if (deleted && this.editingSubjectId() === subject.id) {
      this.resetSubjectForm();
    }
  }
}
