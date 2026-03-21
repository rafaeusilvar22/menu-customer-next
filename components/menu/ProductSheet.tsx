'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/format';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';

interface Props {
  product: Product | null;
  slug: string;
  hasActiveOrder: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function ProductSheet({ product, slug, hasActiveOrder, onClose, onAdded }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setAdding(false);
    }
  }, [product?.uuid]);

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [product, onClose]);

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(slug, product.id, quantity, notes || undefined);
      onAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-overlay-fade"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="relative w-full max-w-md lg:max-w-2xl mx-auto bg-white rounded-t-2xl lg:rounded-2xl animate-sheet-up flex flex-col max-h-[85vh] lg:max-h-[80vh]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95 transition-transform z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Product image */}
          <div className="relative w-full h-56 bg-gray-100 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                🍽️
              </div>
            )}
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-full">
                  Indisponível
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{product.description}</p>
            )}
            <p className="text-[var(--color-primary)] font-bold text-2xl mt-3">
              {formatCurrency(product.price)}
            </p>

            {/* Notes */}
            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Observações <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: sem cebola, bem passado..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Quantity + total */}
            <div className="mt-4 flex items-center justify-between pb-4">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <span className="font-bold text-gray-800 text-lg">
                {formatCurrency(product.price * quantity)}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-4 pt-3 pb-safe border-t border-gray-100 flex-shrink-0">
          {hasActiveOrder ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 text-center">
              <p className="text-amber-700 text-sm font-semibold">⏳ Pedido em andamento</p>
              <p className="text-amber-600 text-xs mt-0.5">
                Aguarde a conclusão do pedido atual para adicionar novos itens.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleAdd}
              loading={adding}
              disabled={!product.is_available}
              className="w-full py-4 text-base rounded-2xl"
            >
              {product.is_available ? `Adicionar · ${formatCurrency(product.price * quantity)}` : 'Indisponível'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
