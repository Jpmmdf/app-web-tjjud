import { normalizeTextValue } from './text-normalizer';

describe('normalizeTextValue', () => {
  it('collapses duplicate whitespace and trims edges', () => {
    expect(normalizeTextValue('  Machado   de   Assis  ')).toBe('Machado de Assis');
  });

  it('returns an empty string for blank values', () => {
    expect(normalizeTextValue('   ')).toBe('');
    expect(normalizeTextValue(null)).toBe('');
  });
});
