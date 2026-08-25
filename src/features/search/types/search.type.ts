import { Product } from "../../products/types/product.type";

export type { Product as SearchResult };

export interface SearchQuery {
  name: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  products: Product[];
  totalCount: number;
}
