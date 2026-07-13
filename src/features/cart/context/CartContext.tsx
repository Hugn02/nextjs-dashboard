"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Cart, CartItem, CartSummary } from "../types/cart.type";
import * as cartService from "../services/cart.service";

interface CartContextType {
  cart: Cart | null;
  summary: CartSummary;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialSummary: CartSummary = {
  subtotal: 0,
  shippingFee: 0,
  total: 0,
  itemCount: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [summary, setSummary] = useState<CartSummary>(initialSummary);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSummary = useCallback((cartData: Cart | null): CartSummary => {
    if (!cartData || !cartData.items) {
      return initialSummary;
    }
    const subtotal = cartData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
    // Shipping: free for order >= 2,000,000đ, otherwise 30,000đ
    const shippingFee = subtotal >= 2000000 || subtotal === 0 ? 0 : 30000;
    const total = subtotal + shippingFee;

    return {
      subtotal,
      shippingFee,
      total,
      itemCount,
    };
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
      setSummary(calculateSummary(data));
    } catch (err: any) {
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [calculateSummary]);

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      setSummary(calculateSummary(data));
    } catch (err: any) {
      setError(err.message || "Failed to add item to cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.updateCartItem(productId, quantity);
      setCart(data);
      setSummary(calculateSummary(data));
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.removeFromCart(productId);
      setCart(data);
      setSummary(calculateSummary(data));
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      await cartService.clearCart();
      setCart(null);
      setSummary(initialSummary);
    } catch (err: any) {
      setError(err.message || "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        loading,
        error,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
