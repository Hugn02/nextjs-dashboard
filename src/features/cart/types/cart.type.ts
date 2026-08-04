import { Product } from "@/src/features/products/types/product.type";

export interface CartItem {
  id: string;        // cartId — id bản ghi cart, dùng để gọi PATCH/DELETE /carts/:cartId
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;     // tổng tiền từ BE (chưa tính phí ship)
}

export interface CartSummary {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}
