import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogApiService } from './catalog-api.service';

describe('CatalogApiService', () => {
  let service: CatalogApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CatalogApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request paged books with filters', () => {
    service.listBooks({ title: 'Dom', authorId: 7, subjectId: 3 }).subscribe();

    const request = httpTesting.expectOne((req) => req.url === '/api/v1/books');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('title')).toBe('Dom');
    expect(request.request.params.get('authorId')).toBe('7');
    expect(request.request.params.get('subjectId')).toBe('3');
    expect(request.request.params.get('size')).toBe('100');

    request.flush({ items: [], metadata: { page: 0, size: 100, totalItems: 0, totalPages: 0 } });
  });

  it('should export the author report as pdf blob', () => {
    service.exportBooksByAuthorReport(12).subscribe();

    const request = httpTesting.expectOne((req) => req.url === '/api/v1/reports/books-by-author/export');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('authorId')).toBe('12');
    expect(request.request.responseType).toBe('blob');

    request.flush(new Blob(), { status: 200, statusText: 'OK' });
  });
});
