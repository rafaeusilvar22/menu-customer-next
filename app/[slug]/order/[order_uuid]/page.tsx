'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { OrderStepper } from '@/components/order/OrderStepper';
import { OrderChat } from '@/components/order/OrderChat';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, ORDER_STATUS_LABELS } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { OrderItem } from '@/types/order';
import { useCart } from '@/hooks/useCart';

interface Props {
  params: Promise<{ slug: string; order_uuid: string }>;
}

export default function OrderPage({ params }: Props) {
  const { slug, order_uuid } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useOrderTracking(slug, order_uuid);
  const { reset } = useCart();

  // Clear cart state after successful checkout — avoids flash of empty cart on the previous page
  useEffect(() => {
    reset();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <BackButton onClick={() => router.push(`/${slug}`)} />
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <h1 className="font-semibold text-gray-800">Acompanhar pedido</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : order ? (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Pedido #{order.order_uuid.slice(0, 8).toUpperCase()}</p>
                <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-medium">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            <OrderStepper status={order.status} />

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Itens do pedido</h3>
              <div className="space-y-2">
                {order.items.map((item: OrderItem) => (
                  <div key={item.uuid ?? item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}× {item.product_name}
                    </span>
                    <span className="font-medium text-gray-800">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            <OrderChat slug={slug} order_uuid={order_uuid} orderStatus={order.status} />

            <Button
              variant="ghost"
              onClick={() => router.push(`/${slug}`)}
              className="w-full"
            >
              Voltar ao cardápio
            </Button>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">Pedido não encontrado.</div>
        )}
      </div>
    </div>
  );
}
