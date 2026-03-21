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
}
