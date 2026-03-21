'use client';

import { useRef, useEffect } from 'react';
import { ProductCategory } from '@/types/product';

interface Props {
  categories: ProductCategory[];
  activeCategory: string | null;
  onSelect: (uuid: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activeCategory) return;
    tabRefs.current[activeCategory]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeCategory]);

  if (categories.length === 0) return null;

  return (
    <div className="flex overflow-x-auto scrollbar-hide bg-white border-b border-gray-200 sticky top-0 z-20">
      {/* Todos tab */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
          activeCategory === null
            ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
            : 'border-transparent text-gray-500'
        }`}
      >
        Todos
      </button>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.uuid;
        return (
          <button
            key={cat.uuid}
            ref={(el) => { tabRefs.current[cat.uuid] = el; }}
            onClick={() => onSelect(cat.uuid)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
