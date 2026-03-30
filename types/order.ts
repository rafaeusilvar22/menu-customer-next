export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type DeliveryType = 'table' | 'pickup' | 'delivery';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'other';

export interface OrderItem {
  id: number;
  uuid: string;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string;
  subtotal: number;
}

export interface Order {
  order_uuid: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderMessage {
  id: number;
  uuid: string;
  content: string;
  sender_type: 'customer' | 'workspace';
  sender_name: string;
  created_at: string;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  payment_method?: PaymentMethod;
  delivery_type?: DeliveryType;
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  notes?: string;
  table_number?: string;
  coupon_code?: string;
}

export interface CouponValidationResult {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discount_amount: number;
  final_amount: number;
}
