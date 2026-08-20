"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useWishlist from "@/src/features/wishlist/hooks/useWishlist";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";

/**
 * WishlistFab — Nút tim nổi cố định, hiển thị cạnh ChatWidget.
 * Vị trí: fixed bottom-6 right-24 (cách ChatWidget ~80px sang trái)
 * Badge đỏ hiển thị số lượng sản phẩm yêu thích.
 */
export default function WishlistFab() {
  const [mounted, setMounted] = useState(false);
  const { wishlistCount } = useWishlist();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tránh lỗi Hydration Mismatch giữa Server và Client khi đọc Auth state từ localStorage/store
  if (!mounted || !isAuthenticated) return null;

  return (
    <Link
      href="/wishlist"
      className="fixed bottom-22 md:bottom-26 right-7 md:right-7 z-[9998] group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#ede0c4] text-[#c4a84f] shadow-[0_4px_20px_rgba(0,0,0,0.12)] cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-red-50 hover:border-red-200 hover:text-red-500 hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)] active:scale-95 no-underline"
      aria-label="Sản phẩm yêu thích"
      title="Sản phẩm yêu thích"
    >
      {/* Heart icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={wishlistCount > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={wishlistCount > 0 ? 0 : 1.8}
        className={`w-6 h-6 transition-all duration-300 ${wishlistCount > 0 ? "text-red-500 group-hover:text-red-500" : "group-hover:text-red-400"
          }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>

      {/* Badge số lượng */}
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm border border-white leading-none">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      )}
    </Link>
  );
}
