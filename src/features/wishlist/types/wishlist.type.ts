import { Product } from "@/src/features/products/types/product.type";

export interface WishlistProduct extends Product {
  addedAt?: string;
}

export interface WishlistState {
  items: WishlistProduct[];
  total: number;
  /** Set của productId đã yêu thích — để check isWishlisted O(1) */
  wishlistedIds: Set<string>;
}
