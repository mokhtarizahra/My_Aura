'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
}
