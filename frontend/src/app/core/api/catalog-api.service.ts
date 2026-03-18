import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Author,
  AuthorBookReport,
  Book,
  BookUpsertPayload,
  PageResponse,
  Subject,
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  listAuthors(query = ''): Observable<PageResponse<Author>> {
    const params = this.withPaging(this.appendStringParam(new HttpParams(), 'q', query));
    return this.http.get<PageResponse<Author>>(`${this.baseUrl}/authors`, { params });
  }

  createAuthor(payload: Pick<Author, 'name'>): Observable<Author> {
    return this.http.post<Author>(`${this.baseUrl}/authors`, payload);
  }

  updateAuthor(authorId: number, payload: Pick<Author, 'name'>): Observable<Author> {
    return this.http.put<Author>(`${this.baseUrl}/authors/${authorId}`, payload);
  }

  deleteAuthor(authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/authors/${authorId}`);
  }

  listSubjects(query = ''): Observable<PageResponse<Subject>> {
    const params = this.withPaging(this.appendStringParam(new HttpParams(), 'q', query));
    return this.http.get<PageResponse<Subject>>(`${this.baseUrl}/subjects`, { params });
  }

  createSubject(payload: Pick<Subject, 'description'>): Observable<Subject> {
    return this.http.post<Subject>(`${this.baseUrl}/subjects`, payload);
  }

  updateSubject(subjectId: number, payload: Pick<Subject, 'description'>): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/subjects/${subjectId}`, payload);
  }

  deleteSubject(subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subjects/${subjectId}`);
  }

  listBooks(filters: { title?: string; authorId?: number | null; subjectId?: number | null }): Observable<PageResponse<Book>> {
    let params = this.withPaging(new HttpParams());
    params = this.appendStringParam(params, 'title', filters.title);
    params = this.appendNumberParam(params, 'authorId', filters.authorId);
    params = this.appendNumberParam(params, 'subjectId', filters.subjectId);
    return this.http.get<PageResponse<Book>>(`${this.baseUrl}/books`, { params });
  }

  createBook(payload: BookUpsertPayload): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/books`, payload);
  }

  updateBook(bookId: number, payload: BookUpsertPayload): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/books/${bookId}`, payload);
  }

  deleteBook(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/books/${bookId}`);
  }

  getBooksByAuthorReport(authorId?: number | null): Observable<AuthorBookReport> {
    const params = this.appendNumberParam(new HttpParams(), 'authorId', authorId);
    return this.http.get<AuthorBookReport>(`${this.baseUrl}/reports/books-by-author`, { params });
  }

  exportBooksByAuthorReport(authorId?: number | null): Observable<Blob> {
    const params = this.appendNumberParam(new HttpParams(), 'authorId', authorId);
    return this.http.get(`${this.baseUrl}/reports/books-by-author/export`, {
      params,
      responseType: 'blob',
    });
  }

  private withPaging(params: HttpParams): HttpParams {
    return params.set('page', 0).set('size', 100);
  }

  private appendStringParam(params: HttpParams, key: string, value?: string | null): HttpParams {
    const trimmed = value?.trim();
    return trimmed ? params.set(key, trimmed) : params;
  }

  private appendNumberParam(params: HttpParams, key: string, value?: number | null): HttpParams {
    return value == null ? params : params.set(key, value);
  }
}
