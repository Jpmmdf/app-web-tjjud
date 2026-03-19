import type { AuthorSummary } from './authors.models';
import type { SubjectSummary } from './subjects.models';

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
