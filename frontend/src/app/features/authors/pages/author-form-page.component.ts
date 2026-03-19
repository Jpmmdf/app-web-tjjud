import { Component } from '@angular/core';
import { AuthorFormComponent } from '../components/author-form.component';

@Component({
  selector: 'app-author-form-page',
  standalone: true,
  imports: [AuthorFormComponent],
  template: '<app-author-form></app-author-form>',
})
export class AuthorFormPageComponent {}
