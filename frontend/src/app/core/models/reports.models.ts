import type { PageMetadata } from './common.models';
import type { SubjectSummary } from './subjects.models';

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
  items: ReportAuthorGroup[];
  page: PageMetadata;
}
