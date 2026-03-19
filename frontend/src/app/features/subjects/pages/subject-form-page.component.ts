import { Component } from '@angular/core';
import { SubjectFormComponent } from '../components/subject-form.component';

@Component({
  selector: 'app-subject-form-page',
  standalone: true,
  imports: [SubjectFormComponent],
  template: '<app-subject-form></app-subject-form>',
})
export class SubjectFormPageComponent {}
