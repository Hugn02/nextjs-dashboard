import { Product } from "../../products/types/product.type";

export type { Product as SearchResult };

export interface SearchQuery {
  name: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  products: Product[];
  totalCount: number;
}
