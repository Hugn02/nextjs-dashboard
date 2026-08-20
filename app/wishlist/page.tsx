"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import useWishlist from "@/src/features/wishlist/hooks/useWishlist";
import ProductCard from "@/src/features/products/components/ProductCard";

const ITEMS_PER_PAGE = 10;

export default function WishlistPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, wishlistCount, loading, refreshWishlist } = useWishlist();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect nếu chưa login
  useEffect(() => {
    if (mounted && !isAuthenticated && !loading) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      router.push("/");
    }
  }, [mounted, isAuthenticated, loading, router]);

  // Refresh khi vào trang
  useEffect(() => {
    if (mounted && isAuthenticated) {
      refreshWishlist();
    }
  }, [mounted, isAuthenticated]);

  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [items.length, totalPages, page]);

  if (!mounted || !isAuthenticated) return null;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf7f2] pt-[100px] md:pt-[130px] pb-24">
        {/* Hero header */}
        <div className="bg-white border-b border-[#ede0c4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center gap-3 mb-1">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-[#999] font-sans">
                <Link href="/" className="hover:text-[#c4a84f] transition-colors">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-[#2c1a00]">Sản phẩm yêu thích</span>
              </nav>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl md:text-4xl font-bold text-[#2c1a00] uppercase tracking-wider mt-2">
                  Sản phẩm yêu thích
                </h1>
                <p className="text-xs md:text-sm text-[#888] font-sans mt-1">
                  {loading
                    ? "Đang tải..."
                    : wishlistCount > 0
                    ? `${wishlistCount} sản phẩm${totalPages > 1 ? ` (Trang ${page}/${totalPages})` : ""}`
                    : "Chưa có sản phẩm yêu thích"}
                </p>
              </div>
              {wishlistCount > 0 && (
                <Link
                  href="/products/all"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-[#c4a84f] text-[#c4a84f] text-xs font-bold uppercase tracking-wider font-['Cormorant_Garamond',_Georgia,_serif] rounded-[2px] hover:bg-[#c4a84f] hover:text-white transition-all duration-200 no-underline"
                >
                  Tiếp tục mua sắm →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-[2px] border border-[#ede0c4]"
                >
                  <div className="aspect-square bg-[#f0ebe0]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#e8e0d0] rounded w-3/4" />
                    <div className="h-3 bg-[#e8e0d0] rounded w-1/2" />
                    <div className="h-4 bg-[#e8e0d0] rounded w-2/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-[#f7f3eb] border border-[#ede0c4] flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c4a84f"
                  strokeWidth={1.5}
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </div>
              <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-bold text-[#2c1a00] uppercase tracking-wider mb-3">
                Chưa có sản phẩm yêu thích
              </h2>
              <p className="text-[#888] font-sans text-sm max-w-sm leading-relaxed mb-8">
                Nhấn vào biểu tượng ❤️ trên các sản phẩm để lưu vào danh sách
                yêu thích của bạn.
              </p>
              <Link
                href="/products/all"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c4a84f] text-white text-sm font-bold uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] rounded-[2px] hover:bg-[#a8893a] transition-colors no-underline"
              >
                Khám phá sản phẩm →
              </Link>
            </div>
          )}

          {/* Product grid — dùng ProductCard chuẩn đầy đủ */}
          {!loading && items.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {currentItems.map((item) => (
                  <ProductCard key={item.id || item._id} product={item} />
                ))}
              </div>

              {/* Phân trang (Pagination) */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 font-['Cormorant_Garamond',_Georgia,_serif]">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-[2px] border border-[#c4a84f] bg-white text-[#c4a84f] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c4a84f] hover:text-white transition-colors cursor-pointer"
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    const isActive = pNum === page;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-[2px] text-sm font-bold cursor-pointer transition-colors border ${
                          isActive
                            ? "bg-[#c4a84f] text-white border-[#c4a84f]"
                            : "bg-white text-[#2c1a00] border-[#ede0c4] hover:border-[#c4a84f] hover:text-[#c4a84f]"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-[2px] border border-[#c4a84f] bg-white text-[#c4a84f] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c4a84f] hover:text-white transition-colors cursor-pointer"
                    aria-label="Trang tiếp"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}

          {/* Nav link ở dưới */}
          {!loading && (
            <div className="mt-12 pt-8 border-t border-[#ede0c4] flex items-center justify-center">
              <Link
                href="/profile"
                className="text-xs md:text-sm text-[#888] hover:text-[#c4a84f] font-sans transition-colors no-underline"
              >
                ← Quay về hồ sơ của bạn
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
