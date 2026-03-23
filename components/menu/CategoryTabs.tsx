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

  const baseTab = `
    relative flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full
    whitespace-nowrap transition-all duration-200
    focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-1
  `;

  return (
    <div className="flex overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 sticky top-0 z-20 px-3 gap-1 py-2 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]">
      {/* All tab */}
      <button
        onClick={() => onSelect(null)}
        className={`${baseTab} ${
          activeCategory === null
            ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30 scale-[1.02]'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 active:scale-95'
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
            className={`${baseTab} ${
              isActive
                ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30 scale-[1.02]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 active:scale-95'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
