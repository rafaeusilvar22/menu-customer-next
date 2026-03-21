'use client';

import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';

export function useOrderTracking(slug: string, order_uuid: string) {
  return useQuery({
    queryKey: ['order', slug, order_uuid],
    queryFn: () => slugApi(slug).trackOrder(order_uuid),
    refetchInterval: 10000,
    enabled: !!order_uuid,
  });
}
