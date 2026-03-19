import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { appendStringParam, withQueryPage } from './api-helpers';
import { Author } from '../models/authors.models';
import { PageResponse, QueryPageRequest } from '../models/common.models';

export interface AuthorListRequest extends QueryPageRequest {
  query?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthorsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/authors';

  list(request: AuthorListRequest): Observable<PageResponse<Author>> {
    const params = withQueryPage(appendStringParam(new HttpParams(), 'q', request.query), request);
    return this.http.get<PageResponse<Author>>(this.baseUrl, { params });
  }

  get(authorId: number): Observable<Author> {
    return this.http.get<Author>(`${this.baseUrl}/${authorId}`);
  }

  create(payload: Pick<Author, 'name'>): Observable<Author> {
    return this.http.post<Author>(this.baseUrl, payload);
  }

  update(authorId: number, payload: Pick<Author, 'name'>): Observable<Author> {
    return this.http.put<Author>(`${this.baseUrl}/${authorId}`, payload);
  }

  delete(authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${authorId}`);
  }
}
