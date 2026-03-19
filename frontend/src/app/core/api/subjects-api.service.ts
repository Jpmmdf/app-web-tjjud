import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { appendStringParam, withQueryPage } from './api-helpers';
import { PageResponse, QueryPageRequest } from '../models/common.models';
import { Subject } from '../models/subjects.models';

export interface SubjectListRequest extends QueryPageRequest {
  query?: string;
}

@Injectable({ providedIn: 'root' })
export class SubjectsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/subjects';

  list(request: SubjectListRequest): Observable<PageResponse<Subject>> {
    const params = withQueryPage(appendStringParam(new HttpParams(), 'q', request.query), request);
    return this.http.get<PageResponse<Subject>>(this.baseUrl, { params });
  }

  get(subjectId: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.baseUrl}/${subjectId}`);
  }

  create(payload: Pick<Subject, 'description'>): Observable<Subject> {
    return this.http.post<Subject>(this.baseUrl, payload);
  }

  update(subjectId: number, payload: Pick<Subject, 'description'>): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/${subjectId}`, payload);
  }

  delete(subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${subjectId}`);
  }
}
