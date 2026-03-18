import { ptBrCatalogMessages } from '../../core/i18n/pt-br';

export function formatCurrencyTotal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return ptBrCatalogMessages.common.noExecution;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function joinAuthorNames(authors: ReadonlyArray<{ name: string }>): string {
  return authors.map((author) => author.name).join(', ');
}

export function joinSubjectDescriptions(subjects: ReadonlyArray<{ description: string }>): string {
  return subjects.map((subject) => subject.description).join(', ');
}
