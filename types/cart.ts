export interface CartItemAddon {
  id: number;
  addon_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartItem {
  id: number;
  uuid: string;
  product_id: number;
  product_uuid: string | null;
  product_name: string;
  product_price: number;
  product_image_url: string;
  quantity: number;
  notes: string;
  addons: CartItemAddon[];
  subtotal: number;
}

export interface Cart {
  id: number;
  token: string;
  workspace_id: number;
  items: CartItem[];
  created_at: string;
}
