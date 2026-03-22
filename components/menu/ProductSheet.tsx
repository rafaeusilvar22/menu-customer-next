'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, AddonGroup, Addon } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/format';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { RecommendedProducts } from '@/components/menu/RecommendedProducts';
import { slugApi } from '@/lib/api';

interface Props {
  product: Product | null;
  slug: string;
  hasActiveOrder: boolean;
  onClose: () => void;
  onAdded: () => void;
  onSelectProduct?: (product: Product) => void;
}

export function ProductSheet({ product, slug, hasActiveOrder, onClose, onAdded, onSelectProduct }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});
  const [addingRecId, setAddingRecId] = useState<number | null>(null);
  const { addItem, cart } = useCart();
  const cartCount = cart?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;
  const cartTotal = cart?.items.reduce((a, i) => a + i.subtotal, 0) ?? 0;

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setAdding(false);
      setFullProduct(null);
      setSelectedAddons({});
      slugApi(slug).getProduct(product.uuid).then(setFullProduct).catch(() => {});
    }
  }, [product?.uuid, slug]);

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

  const toggleAddon = (group: AddonGroup, addon: Addon) => {
    setSelectedAddons((prev) => {
      const current = prev[addon.id] ?? 0;
      if (current > 0) {
        return { ...prev, [addon.id]: 0 };
      }
      const next = { ...prev };
      if (group.max_qty === 1) {
        group.addons.forEach((a) => { next[a.id] = 0; });
      }
      next[addon.id] = 1;
      return next;
    });
  };

  // Build a flat price lookup from all addon groups
  const addonPriceMap: Record<number, number> = {};
  (fullProduct?.addon_groups ?? []).forEach((g) => {
    g.addons.forEach((a) => { addonPriceMap[a.id] = a.price; });
  });

  const addonTotal = Object.entries(selectedAddons).reduce(
    (sum, [id, qty]) => sum + (addonPriceMap[Number(id)] ?? 0) * qty,
    0
  );

  const itemTotal = (product ? product.price + addonTotal : 0) * quantity;

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      const addons = Object.entries(selectedAddons)
        .filter(([, qty]) => qty > 0)
        .map(([addon_id, qty]) => ({ addon_id: Number(addon_id), quantity: qty }));
      await addItem(slug, product.id, quantity, notes || undefined, addons.length > 0 ? addons : undefined);
      onAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleAddRecommended = async (rec: Product, qty: number) => {
    setAddingRecId(rec.id);
    try {
      await addItem(slug, rec.id, qty);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingRecId(null);
    }
  };

  if (!product) return null;

  const addonGroups = fullProduct?.addon_groups ?? [];
  const recommendations = fullProduct?.recommendations ?? [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-overlay-fade"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="relative w-full max-w-md lg:max-w-2xl mx-auto bg-white rounded-t-3xl lg:rounded-3xl animate-sheet-up flex flex-col max-h-[88vh] lg:max-h-[80vh] shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-400 active:scale-95 transition-transform z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Product image */}
          <div className="relative w-full h-56 bg-gray-50 flex-shrink-0">
            {product.image_url ? (
              <>
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">
                🍽️
              </div>
            )}
            {!product.is_available && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-5 py-2 rounded-full">
                  Indisponível
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-xl font-semibold text-gray-900 leading-snug">{product.name}</h2>
            {product.description && (
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{product.description}</p>
            )}
            <p className="text-[var(--color-primary)] font-bold text-2xl mt-3">
              {formatCurrency(product.price)}
            </p>

            {/* Addon groups */}
            {addonGroups.length > 0 && (
              <div className="mt-5 space-y-5">
                {addonGroups.map((group) => (
                  <div key={group.uuid}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">{group.name}</p>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {group.min_qty > 0 ? 'Obrigatório' : 'Opcional'}
                        {group.max_qty > 0 ? ` · máx ${group.max_qty}` : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.addons.map((addon) => {
                        const selected = (selectedAddons[addon.id] ?? 0) > 0;
                        return (
                          <button
                            key={addon.uuid}
                            onClick={() => toggleAddon(group, addon)}
                            disabled={!addon.is_available}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all disabled:opacity-40 active:scale-[0.99] ${
                              selected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <span className={`text-sm font-medium ${selected ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                              {addon.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {addon.price > 0 && (
                                <span className={`text-sm ${selected ? 'text-[var(--color-primary)] font-bold' : 'text-gray-400'}`}>
                                  +{formatCurrency(addon.price)}
                                </span>
                              )}
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'
                              }`}>
                                {selected && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <RecommendedProducts
                  products={recommendations}
                  addingId={addingRecId}
                  onAdd={handleAddRecommended}
                />
              </div>
            )}

            {/* Divider */}
            <div className="mt-5 border-t border-gray-100" />

            {/* Notes */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Observações <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: sem cebola, bem passado..."
                rows={2}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-gray-300"
              />
            </div>

            {/* Quantity + total */}
            <div className="mt-4 flex items-center justify-between pb-5">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <span className="font-semibold text-gray-800 text-lg">
                {formatCurrency(itemTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-5 pt-3 pb-safe border-t border-gray-100 flex-shrink-0 space-y-2">
          {/* Cart summary — visible when items already in cart */}
          {cartCount > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5">
              <span className="text-xs text-gray-500">
                Carrinho · {cartCount} {cartCount === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-sm font-bold text-[var(--color-primary)]">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          )}

          {hasActiveOrder ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 text-center">
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
              className="w-full py-4 text-base rounded-2xl font-semibold"
            >
              {product.is_available ? `Adicionar · ${formatCurrency(itemTotal)}` : 'Indisponível'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
