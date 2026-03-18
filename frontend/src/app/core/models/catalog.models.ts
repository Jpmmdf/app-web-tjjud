export interface PageMetadata {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface PageResponse<T> {
  items: T[];
  metadata: PageMetadata;
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

export interface Author {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  description: string;
}

export interface AuthorSummary {
  id: number;
  name: string;
}

export interface SubjectSummary {
  id: number;
  description: string;
}

export interface Book {
  id: number;
  title: string;
  publisher: string;
  edition: number;
  publicationYear: number;
  price: string;
  authors: AuthorSummary[];
  subjects: SubjectSummary[];
}

export interface BookUpsertPayload {
  title: string;
  publisher: string;
  edition: number;
  publicationYear: number;
  price: string;
  authorIds: number[];
  subjectIds: number[];
}

export interface ReportBookItem {
  bookId: number;
  title: string;
  publisher: string;
  edition: number;
  publicationYear: number;
  price: string;
  subjects: SubjectSummary[];
}

export interface ReportAuthorGroup {
  authorId: number;
  authorName: string;
  books: ReportBookItem[];
}

export interface AuthorBookReport {
  generatedAt: string;
  authors: ReportAuthorGroup[];
}
