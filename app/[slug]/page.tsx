'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEstablishment } from '@/hooks/useEstablishment';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { useActiveOrder } from '@/hooks/useActiveOrder';
import { EstablishmentHeader } from '@/components/menu/EstablishmentHeader';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductSheet } from '@/components/menu/ProductSheet';
import { EstablishmentAbout } from '@/components/menu/EstablishmentAbout';
import { ActiveOrderBanner } from '@/components/menu/ActiveOrderBanner';
import { CartSidePanel } from '@/components/cart/CartSidePanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';
import { Product, ProductCategory } from '@/types/product';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function MenuPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { establishment } = useEstablishment(slug);
  const menu = useMenu(slug);
  const { fetchCart, getItemCount, getTotal } = useCart();
  const businessHours = useBusinessHours(slug);
  const { activeOrder, isFinished } = useActiveOrder(slug);

  useEffect(() => {
    fetchCart(slug);
  }, [slug]);

  const categories = menu.data ?? [];
  const displayedCategories = activeCategory
    ? categories.filter((c: ProductCategory) => c.uuid === activeCategory)
    : categories;

  const handleCategorySelect = (uuid: string | null) => {
    setActiveCategory(uuid);
  };

  const itemCount = getItemCount();
  const total = getTotal();
  const hasActiveOrder = !isFinished && activeOrder;

  // Mobile bottom padding accounts for fixed elements
  const mobilePaddingClass =
    hasActiveOrder && itemCount > 0 ? 'pb-44 lg:pb-0' :
    hasActiveOrder || itemCount > 0 ? 'pb-32 lg:pb-0' :
    'pb-8 lg:pb-0';

  return (
    <div className={mobilePaddingClass}>
      {/* Establishment header — full width */}
      {establishment.isLoading ? (
        <div>
          <Skeleton className="w-full h-44 lg:h-64" />
          <div className="bg-white px-4 pt-3 pb-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="w-16 h-16 rounded-2xl -mt-8" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ) : establishment.data ? (
        <EstablishmentHeader workspace={establishment.data} />
      ) : null}

      {/* Constrained content area */}
      <div className="max-w-[1240px] mx-auto">
        {/* Two-column grid: left=menu, right=cart panel (desktop only) */}
        <div className="lg:grid lg:grid-cols-[1fr_380px]">
          {/* Left column: categories + products */}
          <div className="min-w-0">
            {/* Establishment info */}
            {establishment.data && (
              <EstablishmentAbout
                workspace={establishment.data}
                businessHours={businessHours.data ?? []}
              />
            )}

            {/* Category tabs — sticky */}
            {menu.isLoading ? (
              <div className="px-4 py-3 flex gap-3 bg-white border-b border-gray-200">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
              </div>
            ) : (
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onSelect={handleCategorySelect}
              />
            )}

            {/* Product sections */}
            <div className="px-4 lg:px-6 py-2 lg:pb-16">
              {menu.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                    </div>
                  ))
                : displayedCategories.map((category: ProductCategory) => (
                    <section
                      key={category.uuid}
                      className="pt-4"
                    >
                      <h2 className="font-bold text-gray-800 text-base mb-1">{category.name}</h2>
                      {category.products && category.products.length > 0 ? (
                        <div className="md:grid md:grid-cols-2 md:gap-x-4 lg:block">
                          {category.products.map((product) => (
                            <ProductCard
                              key={product.uuid}
                              product={product}
                              slug={slug}
                              onSelect={setSelectedProduct}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm py-4">Nenhum produto disponível.</p>
                      )}
                    </section>
                  ))}
            </div>
          </div>

          {/* Right column: cart panel (desktop only) */}
          <aside className="hidden lg:block bg-white">
            <CartSidePanel
              slug={slug}
              activeOrder={hasActiveOrder ? activeOrder : null}
            />
          </aside>
        </div>
      </div>

      {/* Mobile-only: Active order banner */}
      {hasActiveOrder && (
        <div className="lg:hidden">
          <ActiveOrderBanner slug={slug} order={activeOrder} />
        </div>
      )}

      {/* Mobile-only: Cart button */}
      {itemCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-safe z-50 animate-cart-spring">
          <button
            onClick={() => router.push(`/${slug}/cart`)}
            className="w-full bg-[var(--color-primary)] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
          >
            <span className="bg-white/25 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">
              {itemCount}
            </span>
            <span className="font-bold text-base">Ver carrinho</span>
            <span className="font-bold text-base">{formatCurrency(total)}</span>
          </button>
        </div>
      )}

      {/* Product sheet */}
      <ProductSheet
        product={selectedProduct}
        slug={slug}
        hasActiveOrder={!!hasActiveOrder}
        onClose={() => setSelectedProduct(null)}
        onAdded={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}
      />
    </div>
  );
}
