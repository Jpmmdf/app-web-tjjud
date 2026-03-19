export interface PageMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  items: T[];
  page: PageMetadata;
}

export type SortDirection = 'ASC' | 'DESC';

export interface QueryPageRequest {
  page: number;
  size: number;
  sortField: string;
  sortDirection: SortDirection;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProblemResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors: ValidationError[];
}
