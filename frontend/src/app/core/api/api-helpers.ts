import { HttpParams } from '@angular/common/http';
import { QueryPageRequest, SortDirection } from '../models/common.models';

export function withQueryPage(params: HttpParams, request: QueryPageRequest): HttpParams {
  return params
    .set('page', request.page)
    .set('size', request.size)
    .set('sortField', request.sortField)
    .set('sortDirection', request.sortDirection);
}

export function appendStringParam(params: HttpParams, key: string, value?: string | null): HttpParams {
  const trimmed = value?.trim();
  return trimmed ? params.set(key, trimmed) : params;
}

export function appendNumberParam(params: HttpParams, key: string, value?: number | null): HttpParams {
  return value == null ? params : params.set(key, value);
}

export function reverseDirection(direction: SortDirection): SortDirection {
  return direction === 'ASC' ? 'DESC' : 'ASC';
}
