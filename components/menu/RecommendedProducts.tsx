'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/format';

interface Props {
  products: Product[];
  title?: string;
  addingId?: number | null;
  onAdd: (product: Product, quantity: number) => void;
}

export function RecommendedProducts({ products, title = 'Peça também', addingId, onAdd }: Props) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  if (products.length === 0) return null;

  const getQty = (id: number) => quantities[id] ?? 0;
  const setQty = (id: number, qty: number) =>
    setQuantities((prev) => ({ ...prev, [id]: qty }));

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>

      <div className="space-y-2">
        {products.map((product) => {
          const qty = getQty(product.id);
          const isAdding = addingId === product.id;

          return (
            <div
              key={product.uuid}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm"
            >
              {/* Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">
                    🍽️
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-[var(--color-primary)] mt-0.5">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {qty === 0 ? (
                  <button
                    onClick={() => setQty(product.id, 1)}
                    disabled={!product.is_available || isAdding}
                    className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center text-xl font-bold disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    +
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        disabled={isAdding}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 active:scale-95 transition-transform disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        disabled={isAdding}
                        className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-[var(--color-primary)] active:scale-95 transition-transform disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        onAdd(product, qty);
                        setQty(product.id, 0);
                      }}
                      disabled={isAdding}
                      className="text-xs font-semibold text-white bg-[var(--color-primary)] px-3 py-1.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 min-w-[72px] text-center"
                    >
                      {isAdding ? '...' : 'Adicionar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
