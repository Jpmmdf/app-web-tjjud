import { Component } from '@angular/core';
import { SubjectPanelComponent } from '../components/subject-panel.component';

@Component({
  selector: 'app-subjects-page',
  standalone: true,
  imports: [SubjectPanelComponent],
  template: '<app-subject-panel></app-subject-panel>',
})
export class SubjectsPageComponent {}
