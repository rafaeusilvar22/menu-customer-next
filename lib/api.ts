import axios from 'axios';
import type { BusinessHours } from '@/types/workspace';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3018';

export const api = axios.create({ baseURL: API_BASE });

export const slugApi = (slug: string) => ({
  getEstablishment: () =>
    api.get(`/public/${slug}`).then((r) => r.data.data),
  getCustomization: () =>
    api.get(`/public/${slug}/customization`).then((r) => r.data.data.customizations?.[0]),
  getMenu: () =>
    api.get(`/public/${slug}/menu`).then((r) => r.data.data.categories),
  getProduct: (prod_uuid: string) =>
    api.get(`/public/${slug}/products/${prod_uuid}`).then((r) => r.data.data.product),
  placeOrder: (body: object) =>
    api.post(`/public/${slug}/orders`, body).then((r) => r.data.data),
  trackOrder: (uuid: string) =>
    api.get(`/public/${slug}/orders/${uuid}`).then((r) => {
      const data = r.data.data;
      return {
        ...data,
        items: (data.items ?? []).map((item: any) => ({
          ...item,
          product_price: item.unit_price,
          subtotal: item.total_price,
        })),
      };
    }),
  getBusinessHours: () =>
    api.get(`/public/${slug}/business-hours`).then((r) => r.data.data.businessHours as BusinessHours[]),
  getMessages: (uuid: string) =>
    api.get(`/public/${slug}/orders/${uuid}/messages`).then((r) => r.data.data.messages),
  getCart: (token: string) =>
    api.get(`/public/${slug}/cart/${token}`).then((r) => r.data.data.cart),
  addCartItem: (token: string, body: object) =>
    api.post(`/public/${slug}/cart/${token}/items`, body).then((r) => r.data.data),
  updateCartItem: (token: string, item_id: number, body: object) =>
    api.patch(`/public/${slug}/cart/${token}/items/${item_id}`, body).then((r) => r.data.data),
  removeCartItem: (token: string, item_id: number) =>
    api.delete(`/public/${slug}/cart/${token}/items/${item_id}`).then((r) => r.data.data),
  clearCart: (token: string) =>
    api.delete(`/public/${slug}/cart/${token}`).then((r) => r.data.data),
  checkout: (token: string, body: object) =>
    api.post(`/public/${slug}/cart/${token}/checkout`, body).then((r) => r.data.data),
});
