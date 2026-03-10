'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export function HomeTracker() {
  useEffect(() => {
    track('page_view_home');
  }, []);
  return null;
}
