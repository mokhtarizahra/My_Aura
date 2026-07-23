import { describ, it, expect } from 'vitest';
import { hashToken } from './hashToken.js';

describe('Utility: hashToken', () => {
  it ('it must convert a token into a 64-character hashed string (SHA-256)' , () => {
    // Arrange
    const plainToken = 'my-secret-token-123';

    // Act
    const hashed = hashToken(plainToken);

    // Assert
    expect(typeof hashed).toBe('string');
    expect(hashed).toHaveLength(64);
    expect(hashed).not.toBe(plainToken);
  });

  it('it must always produce the same output for the same input', () => {
    const token = 'test-token';
    expect(hashToken(token)).toBe(hashToken(token));
  });
});