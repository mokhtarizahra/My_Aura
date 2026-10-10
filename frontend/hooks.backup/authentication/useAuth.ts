'use client';

import { AuthContext } from '@/context/authentication/AuthenticationProvider';
import { useContext } from 'react';
import { AuthContextType } from '../../types/auth';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
