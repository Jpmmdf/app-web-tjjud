import { Component } from '@angular/core';
import { BookListComponent } from '../components/book-list.component';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [BookListComponent],
  template: '<app-book-list></app-book-list>',
})
export class BooksPageComponent {}
