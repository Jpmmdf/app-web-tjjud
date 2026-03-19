import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';
import { AuthorsPageComponent } from './features/authors/pages/authors-page.component';
import { AuthorFormPageComponent } from './features/authors/pages/author-form-page.component';
import { BooksPageComponent } from './features/books/pages/books-page.component';
import { BookFormPageComponent } from './features/books/pages/book-form-page.component';
import { CatalogPageComponent } from './features/catalog/pages/catalog-page.component';
import { ReportsPageComponent } from './features/reports/pages/reports-page.component';
import { SubjectFormPageComponent } from './features/subjects/pages/subject-form-page.component';
import { SubjectsPageComponent } from './features/subjects/pages/subjects-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'visao-geral' },
      { path: 'visao-geral', component: CatalogPageComponent },
      { path: 'autores', component: AuthorsPageComponent },
      { path: 'autores/novo', component: AuthorFormPageComponent },
      { path: 'autores/:authorId/editar', component: AuthorFormPageComponent },
      { path: 'assuntos', component: SubjectsPageComponent },
      { path: 'assuntos/novo', component: SubjectFormPageComponent },
      { path: 'assuntos/:subjectId/editar', component: SubjectFormPageComponent },
      { path: 'livros', component: BooksPageComponent },
      { path: 'livros/novo', component: BookFormPageComponent },
      { path: 'livros/:bookId/editar', component: BookFormPageComponent },
      { path: 'relatorios', component: ReportsPageComponent },
    ],
  },
];
