export interface ProductCategory {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image_url: string;
  order: number;
  products?: Product[];
}

export interface Product {
  id: number;
  uuid: string;
  workspace_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  status: string;
  categories: ProductCategory[];
  recommendations?: Product[];
  addon_groups?: AddonGroup[];
}

export interface AddonGroup {
  id: number;
  uuid: string;
  name: string;
  min_qty: number;
  max_qty: number;
  order: number;
  addons: Addon[];
}

export interface Addon {
  id: number;
  uuid: string;
  name: string;
  price: number;
  is_available: boolean;
  order: number;
}
