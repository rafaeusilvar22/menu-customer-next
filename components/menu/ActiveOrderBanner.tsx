'use client';

import Link from 'next/link';
import { ORDER_STATUS_LABELS } from '@/lib/format';
import type { Order } from '@/types/order';

interface Props {
  slug: string;
  order: Order;
}

export function ActiveOrderBanner({ slug, order }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-20 z-40 pointer-events-none">
      <Link
        href={`/${slug}/order/${order.order_uuid}`}
        className="pointer-events-auto flex items-center justify-between w-full bg-[var(--color-secondary)] text-white rounded-2xl px-4 py-3.5 shadow-xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-primary)]" />
          </span>
          <span className="text-sm font-semibold">Pedido em andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs bg-white/20 rounded-lg px-2.5 py-1 font-semibold">
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
