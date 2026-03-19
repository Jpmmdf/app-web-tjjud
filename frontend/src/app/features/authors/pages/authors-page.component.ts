import { Component } from '@angular/core';
import { AuthorPanelComponent } from '../components/author-panel.component';

@Component({
  selector: 'app-authors-page',
  standalone: true,
  imports: [AuthorPanelComponent],
  template: '<app-author-panel></app-author-panel>',
})
export class AuthorsPageComponent {}
