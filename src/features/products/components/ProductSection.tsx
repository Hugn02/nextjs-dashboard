"use client";

import { useState, useEffect } from "react";
import { fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";


// Helper format tiền
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : null;
  const [isHovered, setIsHovered] = useState(false);

  const firstImage = product.imageUrl?.[0] || 'https://placehold.co/400x400/faf7f2/c4a84f?text=No+Image';
  const secondImage = product.imageUrl?.[1];

  return (
    <div
      className="group bg-white border border-[#ede0c4] rounded-[2px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
        <img
          src={firstImage}
          alt={product.productName}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.06] ${isHovered && secondImage ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
        {secondImage && (
          <img src={secondImage} alt={`${product.productName} - ảnh 2`} className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.06] ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        )}
        {discount && discount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#c4a84f] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-[#2c1a00]/88 text-white text-center p-3 text-xs uppercase opacity-0 translate-y-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Xem chi tiết →
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] text-[#c4a84f] tracking-[1.5px] uppercase mb-1.5">
          {product.brandName}
        </p>
        <h3 className="text-[13px] text-[#2c1a00] font-semibold leading-[1.5] mb-3 line-clamp-2">
          {product.productName}
        </h3>
        <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
          <span className="text-base font-bold text-[#8b2500]">
            {formatPrice(product.newPrice)}
          </span>
          {product.oldPrice && (
            <span className="text-[12px] text-[#aaa] line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

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
          slug: 'bo-am-chen-uong-tra',
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
          <a
            href="/collections/bo-am-chen-uong-tra"
            className="text-[12px] text-[#8b6914] no-underline tracking-[2px] uppercase border border-[#c4a84f] px-6 py-2.5 transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Xem tất cả →
          </a>
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
