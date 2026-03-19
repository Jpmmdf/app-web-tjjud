import { Component } from '@angular/core';
import { AuthorListComponent } from '../components/author-list.component';

@Component({
  selector: 'app-authors-page',
  standalone: true,
  imports: [AuthorListComponent],
  template: '<app-author-list></app-author-list>',
})
export class AuthorsPageComponent {}
