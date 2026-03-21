'use client';

import { create } from 'zustand';
import { Cart, CartItem } from '@/types/cart';
import { slugApi } from '@/lib/api';
import { getCartToken, clearCartToken } from '@/lib/cart-token';

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  fetchCart: (slug: string) => Promise<void>;
  addItem: (slug: string, product_id: number, quantity: number, notes?: string) => Promise<void>;
  updateItem: (slug: string, item_id: number, quantity: number) => Promise<void>;
  removeItem: (slug: string, item_id: number) => Promise<void>;
  clearCart: (slug: string) => Promise<void>;
  getItemCount: () => number;
  getTotal: () => number;
  reset: () => void;
}

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async (slug) => {
    set({ loading: true });
    try {
      const token = getCartToken(slug);
      const cart = await slugApi(slug).getCart(token);
      set({ cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (slug, product_id, quantity, notes) => {
    const token = getCartToken(slug);
    await slugApi(slug).addCartItem(token, { product_id, quantity, notes });
    await get().fetchCart(slug);
  },

  updateItem: async (slug, item_id, quantity) => {
    const token = getCartToken(slug);
    await slugApi(slug).updateCartItem(token, item_id, { quantity });
    await get().fetchCart(slug);
  },

  removeItem: async (slug, item_id) => {
    const token = getCartToken(slug);
    await slugApi(slug).removeCartItem(token, item_id);
    await get().fetchCart(slug);
  },

  clearCart: async (slug) => {
    const token = getCartToken(slug);
    await slugApi(slug).clearCart(token);
    set({ cart: null });
  },

  getItemCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  },

  getTotal: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((acc, item) => acc + item.subtotal, 0);
  },

  reset: () => set({ cart: null }),
}));
