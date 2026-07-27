import { beforeEach, describe, expect, it } from 'vitest';

import { storage } from './storage';

describe('storage utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getUser', () => {
    it('should return null when no user is stored', () => {
      // Arrange No data has been saved.

      // Act
      const result = storage.getUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return user when stored', () => {
      // Arrange
      const mockUser = { id: '1', name: 'علی', role: 'admin' };
      sessionStorage.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = storage.getUser();

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when stored data is invalid JSON', () => {
      // Arrange
      sessionStorage.setItem('user', 'invalid-json{{{');

      // Act
      const result = storage.getUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should store user in sessionStorage', () => {
      // Arrange
      const mockUser = { id: '1', name: 'علی', role: 'user' };

      // Act
      storage.setUser(mockUser);

      // Assert
      const stored = sessionStorage.getItem('user');
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });
  });

  describe('clear', () => {
    it('should remove all auth data from storage', () => {
      // Arrange
      storage.setUser({ id: '1', name: 'علی', role: 'user' });
      storage.setAccessToken('token123');
      storage.setRefreshToken('refresh456');

      // Act
      storage.clear();

      // Assert
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
