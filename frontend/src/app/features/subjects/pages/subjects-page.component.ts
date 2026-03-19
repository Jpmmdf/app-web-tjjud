import { Component } from '@angular/core';
import { SubjectListComponent } from '../components/subject-list.component';

@Component({
  selector: 'app-subjects-page',
  standalone: true,
  imports: [SubjectListComponent],
  template: '<app-subject-list></app-subject-list>',
})
export class SubjectsPageComponent {}
