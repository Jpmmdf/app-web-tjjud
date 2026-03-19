import { Component } from '@angular/core';
import { BookPanelComponent } from '../components/book-panel.component';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [BookPanelComponent],
  template: '<app-book-panel></app-book-panel>',
})
export class BooksPageComponent {}
