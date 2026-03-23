export interface ProductCategory {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image_url: string;
  order: number;
  products?: Product[];
}

export interface FlavorIngredient {
  id: number;
  uuid: string;
  name: string;
  order: number;
}

export interface Flavor {
  id: number;
  uuid: string;
  name: string;
  price: number;
  is_available: boolean;
  order: number;
  max_qty: number;
  ingredients: FlavorIngredient[];
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
  max_flavors: number;
  flavors_exact: boolean;
  allow_flavor_repeat: boolean;
  categories: ProductCategory[];
  recommendations?: Product[];
  addon_groups?: AddonGroup[];
  flavors?: Flavor[];
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
