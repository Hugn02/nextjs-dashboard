"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { WishlistProduct } from "../types/wishlist.type";
import * as wishlistService from "../services/wishlist.service";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";

interface WishlistContextType {
  items: WishlistProduct[];
  wishlistedIds: Set<string>;
  wishlistCount: number;
  loading: boolean;
  /** Toggle yêu thích: thêm nếu chưa có, xóa nếu đã có */
  toggleWishlist: (productId: string) => Promise<void>;
  /** Kiểm tra sản phẩm có trong wishlist không */
  isWishlisted: (productId: string) => boolean;
  /** Refresh danh sách từ server */
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const refreshWishlist = useCallback(async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      if (data) {
        setItems(data.items);
        setWishlistedIds(new Set(data.productIds));
      } else {
        setItems([]);
        setWishlistedIds(new Set());
      }
    } catch {
      setItems([]);
      setWishlistedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleWishlist = async (productId: string) => {
    // Nếu chưa login → mở login modal (giống Cart)
    if (!useAuthStore.getState().isAuthenticated) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }

    // Optimistic update
    const wasWishlisted = wishlistedIds.has(productId);
    if (wasWishlisted) {
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setWishlistedIds((prev) => new Set(prev).add(productId));
    }

    // Gọi API
    const result = await wishlistService.toggleWishlist(productId);
    if (!result) {
      // Rollback nếu lỗi
      if (wasWishlisted) {
        setWishlistedIds((prev) => new Set(prev).add(productId));
      } else {
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
      return;
    }

    // Nếu mới thêm thành công → refresh để có đầy đủ thông tin sản phẩm
    if (result.isWishlisted) {
      refreshWishlist();
    }
  };

  const isWishlisted = (productId: string) => wishlistedIds.has(productId);

  // Khi auth thay đổi
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setWishlistedIds(new Set());
    } else {
      refreshWishlist();
    }
  }, [isAuthenticated, refreshWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistedIds,
        wishlistCount: wishlistedIds.size,
        loading,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
};
