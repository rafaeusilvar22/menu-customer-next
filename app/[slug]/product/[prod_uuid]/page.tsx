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

interface Props {
  params: Promise<{ slug: string; prod_uuid: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug, prod_uuid } = use(params);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug, prod_uuid],
    queryFn: () => slugApi(slug).getProduct(prod_uuid),
  });

  const { addItem } = useCart();

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(slug, product.id, quantity, notes || undefined);
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
                {formatCurrency(product.price)}
              </p>

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
                  {formatCurrency(product.price * quantity)}
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
          disabled={!product || !product.is_available}
          className="w-full py-4 text-base rounded-2xl"
        >
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
}
