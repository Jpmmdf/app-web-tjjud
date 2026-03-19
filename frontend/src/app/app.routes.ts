import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';
import { AuthorsPageComponent } from './features/authors/pages/authors-page.component';
import { BooksPageComponent } from './features/books/pages/books-page.component';
import { CatalogPageComponent } from './features/catalog/pages/catalog-page.component';
import { ReportsPageComponent } from './features/reports/pages/reports-page.component';
import { SubjectsPageComponent } from './features/subjects/pages/subjects-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'visao-geral' },
      { path: 'visao-geral', component: CatalogPageComponent },
      { path: 'autores', component: AuthorsPageComponent },
      { path: 'assuntos', component: SubjectsPageComponent },
      { path: 'livros', component: BooksPageComponent },
      { path: 'relatorios', component: ReportsPageComponent },
    ],
  },
];
