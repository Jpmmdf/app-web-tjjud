import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportsApiService } from './reports-api.service';

describe('ReportsApiService', () => {
  let service: ReportsApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReportsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request paged report with sorting', () => {
    service
      .getBooksByAuthorReport({
        authorId: 12,
        page: 2,
        size: 5,
        sortField: 'bookCount',
        sortDirection: 'DESC',
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === '/api/v1/reports/books-by-author');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('authorId')).toBe('12');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('5');
    expect(request.request.params.get('sortField')).toBe('bookCount');
    expect(request.request.params.get('sortDirection')).toBe('DESC');

    request.flush({
      generatedAt: '2026-03-19T00:00:00Z',
      items: [],
      page: { page: 2, size: 5, totalElements: 0, totalPages: 0 },
    });
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
