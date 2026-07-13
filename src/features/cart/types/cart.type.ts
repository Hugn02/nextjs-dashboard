import { Product } from "@/src/features/products/types/product.type";

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  sessionId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartSummary {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}
