"use client";

import { useCartContext } from "../context/CartContext";

export default function useCart() {
  const context = useCartContext();

  return {
    cart: context.cart,
    summary: context.summary,
    cartCount: context.summary.itemCount,
    loading: context.loading,
    error: context.error,
    refreshCart: context.refreshCart,
    addItem: context.addToCart,
    updateItem: context.updateQuantity,
    removeItem: context.removeFromCart,
    clearCart: context.clearCart,
  };
}
