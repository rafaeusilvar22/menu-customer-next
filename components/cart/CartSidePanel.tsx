'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { formatCurrency } from '@/lib/format';
import { ORDER_STATUS_LABELS } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types/order';

interface Props {
  slug: string;
  activeOrder?: Order | null;
}

export function CartSidePanel({ slug, activeOrder }: Props) {
  const router = useRouter();
  const { cart, getTotal, updateItem, removeItem } = useCart();

  const items = cart?.items ?? [];
  const total = getTotal();

  return (
    <div className="sticky top-0 h-screen flex flex-col bg-white border-l border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="font-bold text-gray-800 text-base">Seu pedido</h2>
      </div>

      {/* Active order notice */}
      {activeOrder && (
        <div className="px-4 pt-3 flex-shrink-0">
          <Link
            href={`/${slug}/order/${activeOrder.order_uuid}`}
            className="flex items-center justify-between bg-[var(--color-secondary)] text-white rounded-xl px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-primary)]" />
              </span>
              <span className="font-medium text-xs">Pedido em andamento</span>
            </div>
            <span className="text-xs bg-white/20 rounded-lg px-2 py-0.5 font-semibold whitespace-nowrap">
              {ORDER_STATUS_LABELS[activeOrder.status]}
            </span>
          </Link>
        </div>
      )}

      {/* Cart content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Carrinho vazio</p>
              <p className="text-xs text-gray-400 mt-0.5">Adicione itens do cardápio</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
                {item.product_image_url && (
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={item.product_image_url}
                      alt={item.product_name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product_name}</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                  {item.notes && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">Obs: {item.notes}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(q) => updateItem(slug, item.id, q)}
                    />
                    <button
                      onClick={() => removeItem(slug, item.id)}
                      className="text-xs text-red-400 active:text-red-600 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with total + CTA */}
      {items.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-6 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="font-bold text-[var(--color-primary)] text-xl">{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={() => router.push(`/${slug}/cart`)}
            className="w-full py-3.5 rounded-xl text-base"
          >
            Finalizar pedido
          </Button>
        </div>
      )}
    </div>
  );
}
