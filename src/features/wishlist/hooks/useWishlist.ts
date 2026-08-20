"use client";

import { useWishlistContext } from "../context/WishlistContext";

export default function useWishlist() {
  const context = useWishlistContext();
  return {
    items: context.items,
    wishlistedIds: context.wishlistedIds,
    wishlistCount: context.wishlistCount,
    loading: context.loading,
    toggleWishlist: context.toggleWishlist,
    isWishlisted: context.isWishlisted,
    refreshWishlist: context.refreshWishlist,
  };
}
