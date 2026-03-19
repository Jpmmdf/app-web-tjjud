import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { appendNumberParam, appendStringParam, withQueryPage } from './api-helpers';
import { Book, BookUpsertPayload } from '../models/books.models';
import { PageResponse, QueryPageRequest } from '../models/common.models';

export interface BookListRequest extends QueryPageRequest {
  title?: string;
  authorId?: number | null;
  subjectId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/books';

  list(filters: BookListRequest): Observable<PageResponse<Book>> {
    let params = withQueryPage(new HttpParams(), filters);
    params = appendStringParam(params, 'title', filters.title);
    params = appendNumberParam(params, 'authorId', filters.authorId);
    params = appendNumberParam(params, 'subjectId', filters.subjectId);
    return this.http.get<PageResponse<Book>>(this.baseUrl, { params });
  }

  get(bookId: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${bookId}`);
  }

  create(payload: BookUpsertPayload): Observable<Book> {
    return this.http.post<Book>(this.baseUrl, payload);
  }

  update(bookId: number, payload: BookUpsertPayload): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/${bookId}`, payload);
  }

  delete(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${bookId}`);
  }
}
