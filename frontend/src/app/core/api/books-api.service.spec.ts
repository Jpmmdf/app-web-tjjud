import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BooksApiService } from './books-api.service';

describe('BooksApiService', () => {
  let service: BooksApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BooksApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should request paged books with filters', () => {
    service
      .list({
        title: 'Dom',
        authorId: 7,
        subjectId: 3,
        page: 1,
        size: 10,
        sortField: 'price',
        sortDirection: 'DESC',
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === '/api/v1/books');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('title')).toBe('Dom');
    expect(request.request.params.get('authorId')).toBe('7');
    expect(request.request.params.get('subjectId')).toBe('3');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('size')).toBe('10');
    expect(request.request.params.get('sortField')).toBe('price');
    expect(request.request.params.get('sortDirection')).toBe('DESC');

    request.flush({ items: [], page: { page: 1, size: 10, totalElements: 0, totalPages: 0 } });
  });
});
