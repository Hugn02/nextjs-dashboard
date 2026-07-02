"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";
import ProductCard from "./ProductCard"; // Import ProductCard chung

// Helper format tiền
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white">
      <div className="aspect-square animate-shimmer bg-[linear-gradient(90deg,#f0e8d6_25%,#faf7f2_50%,#f0e8d6_75%)] bg-[length:200%_100%]" />
      <div className="p-3.5">
        <div className="mb-2 h-2.5 w-2/5 rounded bg-[#f0e8d6]" />
        <div className="mb-1.5 h-3 rounded bg-[#f0e8d6]" />
        <div className="mb-1.5 h-3 w-4/5 rounded bg-[#f0e8d6]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#f0e8d6]" />
      </div>
      <style jsx>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Lấy các sản phẩm nổi bật thuộc danh mục "Đồ pha trà"
        const { products } = await fetchProducts({
          category: 'bo-am-chen',
          isFeatured: true,
          status: 'active',
          // limit: 8, // Hiển thị tối đa 8 sản phẩm nổi bật
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        setProducts(products);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm trong ProductSection:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <section className="bg-[#faf7f2] py-[60px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2">
              Nổi bật
            </p>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0">
              ĐỒ PHA TRÀ NỔI BẬT
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-[#c4a84f] to-transparent mt-3.5" />
          </div>
          <a
            href="/collections/do-pha-tra"
            className="text-[12px] text-[#8b6914] no-underline tracking-[2px] uppercase border border-[#c4a84f] px-6 py-2.5 transition-all hover:bg-[#c4a84f] hover:text-white font-['Cormorant_Garamond',_serif]"
          >
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
