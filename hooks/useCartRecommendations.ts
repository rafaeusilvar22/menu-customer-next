'use client';

import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';
import { CartItem } from '@/types/cart';
import { Product } from '@/types/product';

async function fetchRecommendations(slug: string, cartItems: CartItem[]): Promise<Product[]> {
  const uuids = cartItems.map((i) => i.product_uuid).filter(Boolean) as string[];
  if (uuids.length === 0) return [];

  const cartProductIds = new Set(cartItems.map((i) => i.product_id));

  // Fetch full product details (with recommendations) for each cart item in parallel
  const products = await Promise.all(uuids.map((uuid) => slugApi(slug).getProduct(uuid)));

  // Collect all recommendations, deduplicate, filter out items already in cart
  const seen = new Set<number>();
  const result: Product[] = [];

  for (const product of products) {
    for (const rec of product?.recommendations ?? []) {
      if (!seen.has(rec.id) && !cartProductIds.has(rec.id) && rec.is_available) {
        seen.add(rec.id);
        result.push(rec);
      }
    }
  }

  return result;
}

export function useCartRecommendations(slug: string, cartItems: CartItem[]) {
  return useQuery({
    queryKey: ['cart-recommendations', slug, cartItems.map((i) => i.product_id).join(',')],
    queryFn: () => fetchRecommendations(slug, cartItems),
    enabled: cartItems.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}
