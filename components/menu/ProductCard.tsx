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
      className="
        group flex items-center gap-3 py-3.5
        border-b border-gray-100 last:border-0
        cursor-pointer
        hover:bg-white/70 hover:-mx-2 hover:px-2 hover:rounded-2xl
        active:scale-[0.99] active:bg-white/90
        transition-all duration-200
      "
    >
      {/* Left: text stack */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-gray-900 transition-colors duration-150">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[var(--color-primary)] font-bold text-sm">
            {formatCurrency(product.price)}
          </span>
          {!product.is_available && (
            <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded-full">
              Indisponível
            </span>
          )}
        </div>
      </div>

      {/* Right: image with "+" badge */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-200">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">
            🍽️
          </div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        {product.is_available && (
          <div className="
            absolute bottom-1.5 right-1.5
            w-6 h-6 rounded-full
            bg-[var(--color-primary)] shadow-md
            flex items-center justify-center
            group-hover:scale-110 group-hover:shadow-lg
            transition-all duration-200
          ">
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
