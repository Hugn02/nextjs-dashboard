"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";
import ProductCard from "../pages/ProductCard"; // Import ProductCard chung

// Helper format tiền
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 8; // Ở trang chủ thường để cố định số lượng đẹp (với lưới 4 cột)
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Sử dụng service dùng chung để gọi API
        const { products, totalCount } = await fetchProducts({
          // slug: 'bo-am-chen-uong-tra',
          limit: 24,
          status: 'active'
        });
        setProducts(products);
        setTotalCount(totalCount);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm trong ProductSection:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Hiệu ứng tự động chuyển trang (Auto-slide)
  useEffect(() => {
    if (totalPages <= 1 || loading) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000); // Tự động chuyển trang sau mỗi 5 giây

    return () => clearInterval(timer);
  }, [totalPages, loading, currentPage]);

  // Lấy danh sách sản phẩm của trang hiện tại
  const currentProducts = products.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <section className="bg-[#faf7f2] py-[60px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[4px] text-[#c4a84f] uppercase mb-2">
              Bestseller
            </p>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-light text-[#2c1a00] tracking-[2px] m-0">
              TOP BỘ ẤM CHÉN UỐNG TRÀ
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-[#c4a84f] to-transparent mt-3.5" />
          </div>
          {/* <a
            href="/collections/bo-am-chen-uong-tra"
            className="text-[12px] text-[#8b6914] no-underline tracking-[2px] uppercase border border-[#c4a84f] px-6 py-2.5 transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Xem tất cả →
          </a> */}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {loading ? (
            <p className="text-center col-span-full">Đang tải sản phẩm...</p>
          ) : (
            currentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>

        {/* Thanh điều hướng dấu chấm (Pagination Dots) */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2.5 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentPage === i ? "w-10 bg-[#c4a84f]" : "w-2.5 bg-[#ede0c4] hover:bg-[#c4a84f]/50"
                  }`}
                title={`Trang ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
