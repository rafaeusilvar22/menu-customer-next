'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';
import { getActiveOrder, clearActiveOrder } from '@/lib/active-order';
import type { OrderStatus } from '@/types/order';

const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

export function useActiveOrder(slug: string) {
  const [activeUuid, setActiveUuid] = useState<string | null>(null);

  useEffect(() => {
    setActiveUuid(getActiveOrder(slug));
  }, [slug]);

  const query = useQuery({
    queryKey: ['active-order', slug, activeUuid],
    queryFn: () => slugApi(slug).trackOrder(activeUuid!),
    enabled: !!activeUuid,
    refetchInterval: 10_000,
  });

  const isFinished =
    !activeUuid || (!!query.data && TERMINAL_STATUSES.includes(query.data.status));

  useEffect(() => {
    if (isFinished && activeUuid) {
      clearActiveOrder(slug);
      setActiveUuid(null);
    }
  }, [isFinished, activeUuid, slug]);

  return {
    activeUuid,
    activeOrder: query.data ?? null,
    isFinished,
  };
}
