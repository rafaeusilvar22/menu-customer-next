'use client';

import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/format';

interface Props {
  product: Product;
  slug: string;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(product)}
      className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0 active:bg-gray-50/70 transition-colors cursor-pointer"
    >
      {/* Left: text stack */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[var(--color-primary)] font-semibold text-sm">
            {formatCurrency(product.price)}
          </span>
          {!product.is_available && (
            <span className="text-xs text-red-400 font-medium">Indisponível</span>
          )}
        </div>
      </div>

      {/* Right: image with "+" badge */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">
            🍽️
          </div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/35" />
        )}
        {product.is_available && (
          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
