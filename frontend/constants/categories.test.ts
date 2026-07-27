import { describe, expect, it } from 'vitest';

import { CATEGORIES, getCategoryById, getCategoryName } from './categories';

describe('Constants: Categories Data Integrity', () => {
  it('For a valid ID, the complete object must be returned.', () => {
    // Arrange
    const validId = 'football';

    // Act
    const result = getCategoryById(validId);

    // Assert
    expect(result).toBeDefined();
    expect(result?.name).toBe('فوتبال');
    expect(result?.icon).toBe('Trophy');
  });

  it('It should return `undefined` for an invalid ID', () => {
    // Arrange
    const invalidId = 'invalid-id-123' as any;

    // Act
    const result = getCategoryById(invalidId);

    // Assert
    expect(result).toBeUndefined();
  });
});
