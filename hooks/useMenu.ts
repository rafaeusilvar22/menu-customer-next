'use client';

import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';

export function useMenu(slug: string) {
  return useQuery({
    queryKey: ['menu', slug],
    queryFn: () => slugApi(slug).getMenu(),
    staleTime: 2 * 60 * 1000,
  });
}
