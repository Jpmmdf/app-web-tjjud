import { Component } from '@angular/core';
import { BookFormComponent } from '../components/book-form.component';

@Component({
  selector: 'app-book-form-page',
  standalone: true,
  imports: [BookFormComponent],
  template: '<app-book-form></app-book-form>',
})
export class BookFormPageComponent {}
