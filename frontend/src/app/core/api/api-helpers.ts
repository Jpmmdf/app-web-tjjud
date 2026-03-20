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
  const normalized = normalizeTextParam(value);
  return normalized ? params.set(key, normalized) : params;
}

export function appendNumberParam(params: HttpParams, key: string, value?: number | null): HttpParams {
  return value == null ? params : params.set(key, value);
}

export function reverseDirection(direction: SortDirection): SortDirection {
  return direction === 'ASC' ? 'DESC' : 'ASC';
}

function normalizeTextParam(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
}
