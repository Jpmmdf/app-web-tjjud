import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthorsApiService } from '../../../core/api/authors-api.service';
import { BooksApiService } from '../../../core/api/books-api.service';
import { ReportsApiService } from '../../../core/api/reports-api.service';
import { SubjectsApiService } from '../../../core/api/subjects-api.service';
import { PageResponse } from '../../../core/models/common.models';
import { AuthorBookReport } from '../../../core/models/reports.models';
import { CatalogPageComponent } from './catalog-page.component';

const emptyPage = <T>(): PageResponse<T> => ({
  items: [],
  page: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
});

const emptyReport: AuthorBookReport = {
  generatedAt: '2026-03-18T12:00:00Z',
  items: [],
  page: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
};

const authorsApiStub = {
  listAuthors: () => of(emptyPage()),
  createAuthor: () => of({ id: 1, name: 'Autor' }),
  updateAuthor: () => of({ id: 1, name: 'Autor' }),
  deleteAuthor: () => of(void 0),
};

const subjectsApiStub = {
  listSubjects: () => of(emptyPage()),
  createSubject: () => of({ id: 1, description: 'Assunto' }),
  updateSubject: () => of({ id: 1, description: 'Assunto' }),
  deleteSubject: () => of(void 0),
};

const booksApiStub = {
  listBooks: () => of(emptyPage()),
  createBook: () =>
    of({
      id: 1,
      title: 'Livro',
      publisher: 'Editora',
      edition: 1,
      publicationYear: 2026,
      price: '10.00',
      authors: [],
      subjects: [],
    }),
  updateBook: () =>
    of({
      id: 1,
      title: 'Livro',
      publisher: 'Editora',
      edition: 1,
      publicationYear: 2026,
      price: '10.00',
      authors: [],
      subjects: [],
    }),
  deleteBook: () => of(void 0),
};

const reportsApiStub = {
  getBooksByAuthorReport: () => of(emptyReport),
  exportBooksByAuthorReport: () => of(new Blob()),
};

describe('CatalogPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPageComponent],
      providers: [
        { provide: AuthorsApiService, useValue: {
          list: authorsApiStub.listAuthors,
          create: authorsApiStub.createAuthor,
          update: authorsApiStub.updateAuthor,
          delete: authorsApiStub.deleteAuthor,
        } },
        { provide: SubjectsApiService, useValue: {
          list: subjectsApiStub.listSubjects,
          create: subjectsApiStub.createSubject,
          update: subjectsApiStub.updateSubject,
          delete: subjectsApiStub.deleteSubject,
        } },
        { provide: BooksApiService, useValue: {
          list: booksApiStub.listBooks,
          create: booksApiStub.createBook,
          update: booksApiStub.updateBook,
          delete: booksApiStub.deleteBook,
        } },
        { provide: ReportsApiService, useValue: reportsApiStub },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should render the dashboard heading', async () => {
    const fixture = TestBed.createComponent(CatalogPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Catálogo editorial');
    expect(compiled.textContent).toContain('Cadastre e mantenha a base de autores.');
  });
});
