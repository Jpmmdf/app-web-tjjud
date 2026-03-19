import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { appendNumberParam, withQueryPage } from './api-helpers';
import { QueryPageRequest } from '../models/common.models';
import { AuthorBookReport } from '../models/reports.models';

export interface ReportListRequest extends QueryPageRequest {
  authorId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reports/books-by-author';

  getBooksByAuthorReport(request: ReportListRequest): Observable<AuthorBookReport> {
    const params = appendNumberParam(withQueryPage(new HttpParams(), request), 'authorId', request.authorId);
    return this.http.get<AuthorBookReport>(this.baseUrl, { params });
  }

  exportBooksByAuthorReport(authorId?: number | null): Observable<Blob> {
    const params = appendNumberParam(new HttpParams(), 'authorId', authorId);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
