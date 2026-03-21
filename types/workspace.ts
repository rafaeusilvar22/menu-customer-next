export interface WorkspaceCustomization {
  id: number;
  uuid: string;
  workspace_id: number;
  primary_color: string;
  secondary_color: string;
  emphasis_color: string;
  status: string;
}

export interface BusinessHours {
  id: number;
  uuid: string;
  workspace_id: number;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  uuid: string;
  name: string;
  logo: string;
  banner: string | null;
  description: string;
  about: string | null;
  phone: string;
  email: string;
  address: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  domain_url: string;
  status: string;
  type: string;
  delivery_enabled: boolean;
  delivery_fee: number | null;
  avg_preparation_time: number | null;
  min_order_amount: number | null;
  accepted_payment_methods: string[];
}
