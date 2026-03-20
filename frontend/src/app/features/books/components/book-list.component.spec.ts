import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookListComponent } from './book-list.component';
import { CatalogFacadeService } from '../../../core/state/catalog-facade.service';

class CatalogFacadeStub {
  readonly currentBookList = signal({
    title: '',
    authorId: null as number | null,
    subjectId: null as number | null,
    sortField: 'title',
    sortDirection: 'ASC' as const,
  });
  readonly bookPage = signal({
    page: 0,
    totalPages: 1,
    totalElements: 0,
  });
  readonly books = signal([]);
  readonly authorOptions = signal<Array<{ id: number; name: string }>>([]);
  readonly subjectOptions = signal<Array<{ id: number; description: string }>>([]);
  readonly loadBooks = jasmine.createSpy().and.resolveTo();
  readonly deleteBook = jasmine.createSpy().and.resolveTo();
  readonly searchAuthorOptions = jasmine.createSpy().and.resolveTo([{ id: 1, name: 'Machado de Assis' }]);
  readonly searchSubjectOptions = jasmine.createSpy().and.resolveTo([{ id: 1, description: 'Romance' }]);
  readonly getAuthorOption = jasmine.createSpy().and.resolveTo(null);
  readonly getSubjectOption = jasmine.createSpy().and.resolveTo(null);
}

describe('BookListComponent', () => {
  let fixture: ComponentFixture<BookListComponent>;
  let component: BookListComponent;
  let facade: CatalogFacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookListComponent],
      providers: [provideRouter([]), { provide: CatalogFacadeService, useClass: CatalogFacadeStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    facade = TestBed.inject(CatalogFacadeService) as unknown as CatalogFacadeStub;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('normalizes author lookup text before searching', async () => {
    component['bookFiltersForm'].controls.authorQuery.setValue('  Machado   de  Assis ');

    await component['searchAuthors']();

    expect(facade.searchAuthorOptions).toHaveBeenCalledOnceWith('Machado de Assis');
    expect(component['bookFiltersForm'].controls.authorQuery.value).toBe('Machado de Assis');
  });

  it('disables the author search button while the lookup is running', async () => {
    let resolveSearch: ((value: Array<{ id: number; name: string }>) => void) | undefined;
    facade.searchAuthorOptions.and.callFake(
      () =>
        new Promise<Array<{ id: number; name: string }>>((resolve) => {
          resolveSearch = resolve;
        }),
    );

    component['bookFiltersForm'].controls.authorQuery.setValue('Machado');
    const pendingSearch = component['searchAuthors']();
    fixture.detectChanges();

    const searchButton = fixture.nativeElement.querySelectorAll('.lookup-filter__controls button')[0] as HTMLButtonElement;
    expect(searchButton.disabled).toBeTrue();
    expect(searchButton.textContent?.trim()).toBe('Buscando...');

    resolveSearch?.([{ id: 1, name: 'Machado de Assis' }]);
    await pendingSearch;
  });
});
