import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SubjectsApiService } from '../../../core/api/subjects-api.service';
import { ptBrCatalogMessages } from '../../../core/i18n/pt-br';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';
import { normalizeTextValue } from '../../../shared/formatters/text-normalizer';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.scss',
})
export class SubjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subjectsApi = inject(SubjectsApiService);

  protected readonly catalog = inject(CatalogFacadeService);
  protected readonly commonTexts = ptBrCatalogMessages.common;
  protected readonly texts = ptBrCatalogMessages.subjects;
  protected readonly editingSubjectId = signal<number | null>(null);
  protected readonly subjectForm = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(20)]],
  });

  async ngOnInit(): Promise<void> {
    const subjectIdParam = this.route.snapshot.paramMap.get('subjectId');
    if (!subjectIdParam) {
      return;
    }
    const subjectId = Number(subjectIdParam);
    this.editingSubjectId.set(subjectId);
    const subject = await firstValueFrom(this.subjectsApi.get(subjectId));
    this.subjectForm.reset({ description: subject.description });
  }

  protected async submitSubject(): Promise<void> {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const result = await this.catalog.saveSubject(this.editingSubjectId(), {
      description: normalizeTextValue(this.subjectForm.getRawValue().description),
    });
    if (result) {
      await this.router.navigate(['/assuntos']);
    }
  }
}
