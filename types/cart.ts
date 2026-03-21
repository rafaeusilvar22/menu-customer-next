export interface CartItem {
  id: number;
  uuid: string;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image_url: string;
  quantity: number;
  notes: string;
  subtotal: number;
}

export interface Cart {
  id: number;
  token: string;
  workspace_id: number;
  items: CartItem[];
  created_at: string;
}
