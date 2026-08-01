"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Cart, CartItem, CartSummary } from "../types/cart.type";
import * as cartService from "../services/cart.service";

interface CartContextType {
  cart: Cart | null;
  summary: CartSummary;
  loading: boolean;
  error: string | null;
  updatingIds: Set<string>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  // Trạng thái checkbox giỏ hàng — persist qua navigate, reset khi F5
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  // Track items currently performing API update / remove requests
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  // Lưu selectedIds ở Context để persist qua navigate (mà không cần backend)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const calculateSummary = useCallback((cartData: Cart | null): CartSummary => {
    if (!cartData || !cartData.items) {
      return initialSummary;
    }
    const subtotal = cartData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartData.items.length;
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
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        setCart(null);
        setSummary(initialSummary);
        setLoading(false);
        return;
      }
    }
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

  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.dispatchEvent(new CustomEvent("open-login-modal"));
        return false;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      setSummary(calculateSummary(data));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to add item to cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    if (updatingIds.has(productId)) return; // Prevent concurrent requests for same item

    setUpdatingIds((prev) => new Set(prev).add(productId));

    // Optimistic update: cập nhật UI ngay lập tức
    const previousCart = cart;
    const previousSummary = summary;
    if (cart) {
      const optimisticCart: typeof cart = {
        ...cart,
        items: cart.items.map((item) => {
          const pid = item.product?.id || item.product?._id;
          return pid === productId ? { ...item, quantity } : item;
        }),
      };
      setCart(optimisticCart);
      setSummary(calculateSummary(optimisticCart));
    }
    // Gọi API ngầm
    try {
      const data = await cartService.updateCartItem(productId, quantity);
      if (data !== null) {
        setCart(data);
        setSummary(calculateSummary(data));
      }
    } catch (err: any) {
      // Rollback nếu API lỗi
      setCart(previousCart);
      setSummary(previousSummary);
      setError(err.message || "Failed to update quantity");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };


  const removeFromCart = async (productId: string) => {
    if (updatingIds.has(productId)) return;
    setUpdatingIds((prev) => new Set(prev).add(productId));

    // Optimistic update: xóa item khỏi UI ngay
    const previousCart = cart;
    const previousSummary = summary;
    if (cart) {
      const optimisticCart: typeof cart = {
        ...cart,
        items: cart.items.filter((item) => {
          const pid = item.product?.id || item.product?._id;
          return pid !== productId;
        }),
      };
      setCart(optimisticCart);
      setSummary(calculateSummary(optimisticCart));
    }
    try {
      const data = await cartService.removeFromCart(productId);
      if (data !== null) {
        setCart(data);
        setSummary(calculateSummary(data));
      }
    } catch (err: any) {
      // Rollback nếu API lỗi
      setCart(previousCart);
      setSummary(previousSummary);
      setError(err.message || "Failed to remove item");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
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
        updatingIds,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        selectedIds,
        setSelectedIds,
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
