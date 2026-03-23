'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { slugApi } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/format';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Flavor } from '@/types/product';

interface Props {
  params: Promise<{ slug: string; prod_uuid: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug, prod_uuid } = use(params);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<Flavor[]>([]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug, prod_uuid],
    queryFn: () => slugApi(slug).getProduct(prod_uuid),
  });

  const { addItem } = useCart();

  const maxFlavors = product?.max_flavors ?? 0;
  const availableFlavors = (product?.flavors ?? []).filter((f: Flavor) => f.is_available);
  const hasFlavors = maxFlavors > 0 && availableFlavors.length > 0;
  const flavorsExact = product?.flavors_exact ?? false;
  const allowRepeat = product?.allow_flavor_repeat ?? true;
  const maxSameFlavor = product?.max_same_flavor ?? 0;

  const flavorUnitPrice =
    selectedFlavors.length > 0
      ? selectedFlavors.reduce((sum, f) => sum + f.price, 0)
      : (product?.price ?? 0);

  const canAdd =
    !!product &&
    product.is_available &&
    (!hasFlavors ||
      (flavorsExact
        ? selectedFlavors.length === maxFlavors
        : selectedFlavors.length >= 1 && selectedFlavors.length <= maxFlavors));

  const toggleFlavor = (flavor: Flavor) => {
    setSelectedFlavors((prev) => {
      if (allowRepeat) {
        if (prev.length >= maxFlavors) return prev;
        if (maxSameFlavor > 0) {
          const count = prev.filter((f) => f.uuid === flavor.uuid).length;
          if (count >= maxSameFlavor) return prev;
        }
        return [...prev, flavor];
      }
      const isSelected = prev.some((f) => f.uuid === flavor.uuid);
      if (isSelected) return prev.filter((f) => f.uuid !== flavor.uuid);
      if (prev.length >= maxFlavors) return [...prev.slice(0, maxFlavors - 1), flavor];
      return [...prev, flavor];
    });
  };

  const removeFlavor = (flavor: Flavor) => {
    setSelectedFlavors((prev) => {
      const idx = prev.findIndex((f) => f.uuid === flavor.uuid);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      const flavors =
        selectedFlavors.length > 0
          ? selectedFlavors.map((f) => ({ flavor_id: f.uuid }))
          : undefined;
      await addItem(slug, product.id, quantity, notes || undefined, undefined, flavors);
      router.push(`/${slug}`);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <BackButton onClick={() => router.back()} />
          <h1 className="font-semibold text-gray-800">Detalhes do produto</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div>
            <Skeleton className="w-full h-64 lg:h-80" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : product ? (
          <>
            <div className="relative w-full h-64 lg:h-80 bg-gray-100">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                  🍽️
                </div>
              )}
            </div>

            <div className="p-4 lg:p-6">
              <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
              {product.description && (
                <p className="text-gray-500 mt-2 leading-relaxed">{product.description}</p>
              )}
              <p className="text-[var(--color-primary)] font-bold text-2xl mt-3">
                {formatCurrency(flavorUnitPrice)}
              </p>

              {/* ── Seleção de sabores ── */}
              {hasFlavors && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Monte seu pedido
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {flavorsExact
                          ? `Escolha exatamente ${maxFlavors} opç${maxFlavors !== 1 ? 'ões' : 'ão'}`
                          : maxFlavors === 1 ? 'Escolha 1 opção' : `Escolha até ${maxFlavors} opções`}
                        {' '}·{' '}
                        <span className={selectedFlavors.length === 0 ? 'text-red-500' : 'text-green-600'}>
                          {selectedFlavors.length} selecionado{selectedFlavors.length !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>
                    {selectedFlavors.length > 0 && (
                      <button
                        onClick={() => setSelectedFlavors([])}
                        className="text-xs text-gray-400 underline"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {availableFlavors.map((flavor: Flavor) => {
                      const count = selectedFlavors.filter((f: Flavor) => f.uuid === flavor.uuid).length;
                      const isSelected = count > 0;
                      const atMax = selectedFlavors.length >= maxFlavors || (maxSameFlavor > 0 && count >= maxSameFlavor);

                      if (allowRepeat) {
                        // iFood-style: explicit + / − counter
                        return (
                          <div
                            key={flavor.uuid}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                              isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-100'
                            }`}
                          >
                            <div className="flex-1 mr-3">
                              <p className="font-medium text-gray-800 text-sm">{flavor.name}</p>
                              {flavor.ingredients.length > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {flavor.ingredients.map((i: { name: string }) => i.name).join(', ')}
                                </p>
                              )}
                              {flavor.price > 0 && (
                                <p className="text-sm font-semibold text-[var(--color-primary)] mt-0.5">
                                  {formatCurrency(flavor.price)}
                                </p>
                              )}
                            </div>
                            {count === 0 ? (
                              <button
                                onClick={() => toggleFlavor(flavor)}
                                disabled={atMax}
                                className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => removeFlavor(flavor)}
                                  className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center active:scale-95 transition-transform"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                </button>
                                <span className="text-sm font-bold text-[var(--color-primary)] w-4 text-center">{count}</span>
                                <button
                                  onClick={() => toggleFlavor(flavor)}
                                  disabled={atMax}
                                  className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Checkbox-style (allowRepeat = false)
                      return (
                        <button
                          key={flavor.uuid}
                          onClick={() => toggleFlavor(flavor)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                            isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{flavor.name}</p>
                              {flavor.ingredients.length > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {flavor.ingredients.map((i: { name: string }) => i.name).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[var(--color-primary)] ml-2 flex-shrink-0">
                            {formatCurrency(flavor.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Resumo do preço quando meio a meio */}
                  {selectedFlavors.length > 1 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Resumo:</p>
                      {selectedFlavors.map((f, i) => (
                        <div key={`${f.uuid}-${i}`} className="flex justify-between">
                          <span>{f.name}</span>
                          <span>{formatCurrency(f.price)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold text-gray-800 mt-1 pt-1 border-t border-gray-200">
                        <span>Total</span>
                        <span>{formatCurrency(flavorUnitPrice)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, bem passado..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <QuantitySelector value={quantity} onChange={setQuantity} />
                <span className="font-bold text-gray-800 text-lg">
                  {formatCurrency(flavorUnitPrice * quantity)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">Produto não encontrado.</div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-safe">
        <Button
          onClick={handleAdd}
          loading={adding}
          disabled={!canAdd}
          className="w-full py-4 text-base rounded-2xl"
        >
          {hasFlavors && selectedFlavors.length === 0
            ? 'Monte seu pedido'
            : hasFlavors && flavorsExact && selectedFlavors.length < maxFlavors
            ? `Faltam ${maxFlavors - selectedFlavors.length} opção(ões)`
            : `Adicionar · ${formatCurrency(flavorUnitPrice * quantity)}`}
        </Button>
      </div>
    </div>
  );
}
