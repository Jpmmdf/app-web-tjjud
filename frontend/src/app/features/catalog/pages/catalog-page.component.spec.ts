import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogApiService } from '../../../core/api/catalog-api.service';
import { AuthorBookReport, PageResponse } from '../../../core/models/catalog.models';
import { CatalogPageComponent } from './catalog-page.component';

const emptyPage = <T>(): PageResponse<T> => ({
  items: [],
  metadata: { page: 0, size: 100, totalItems: 0, totalPages: 0 },
});

const emptyReport: AuthorBookReport = {
  generatedAt: '2026-03-18T12:00:00Z',
  authors: [],
};

const apiStub = {
  listAuthors: () => of(emptyPage()),
  createAuthor: () => of({ id: 1, name: 'Autor' }),
  updateAuthor: () => of({ id: 1, name: 'Autor' }),
  deleteAuthor: () => of(void 0),
  listSubjects: () => of(emptyPage()),
  createSubject: () => of({ id: 1, description: 'Assunto' }),
  updateSubject: () => of({ id: 1, description: 'Assunto' }),
  deleteSubject: () => of(void 0),
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
  getBooksByAuthorReport: () => of(emptyReport),
  exportBooksByAuthorReport: () => of(new Blob()),
};

describe('CatalogPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPageComponent],
      providers: [{ provide: CatalogApiService, useValue: apiStub }],
    }).compileComponents();
  });

  it('should render the dashboard heading', async () => {
    const fixture = TestBed.createComponent(CatalogPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Catálogo editorial TJJUD');
    expect(compiled.textContent).toContain('Relatório por autor');
  });
});
