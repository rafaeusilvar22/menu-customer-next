'use client';

import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { formatCurrency } from '@/lib/format';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { useCart } from '@/hooks/useCart';

interface Props {
  item: CartItem;
  slug: string;
}

export function CartItemRow({ item, slug }: Props) {
  const { updateItem, removeItem } = useCart();
  const addons = item.addons ?? [];

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-gray-100">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {item.product_image_url && (
          <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={item.product_image_url}
              alt={item.product_name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{item.product_name}</p>

          {/* Addons breakdown */}
          {addons.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    + {addon.name}{addon.quantity > 1 ? ` ×${addon.quantity}` : ''}
                  </span>
                  {addon.price > 0 && (
                    <span className="text-xs text-gray-400 ml-2">
                      +{formatCurrency(addon.subtotal)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {item.notes && (
            <p className="text-gray-400 text-xs mt-1">Obs: {item.notes}</p>
          )}

          {/* Price breakdown */}
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-gray-400">
              {formatCurrency(item.product_price + addons.reduce((s, a) => s + a.price * a.quantity, 0))} × {item.quantity}
            </p>
          </div>
        </div>

        <p className="font-bold text-[var(--color-primary)] text-sm whitespace-nowrap">
          {formatCurrency(item.subtotal)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
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
  );
}
