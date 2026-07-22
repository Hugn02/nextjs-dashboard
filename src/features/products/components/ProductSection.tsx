"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { fetchProducts } from "../services/product.service";
import { Product } from "../types/product.type";
import ProductCard from "./ProductCard"; // Import ProductCard chung

// ─── Swiper Imports ───────────────────────────────────────────────────────────
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// ─── Swiper CSS ───────────────────────────────────────────────────────────────
import 'swiper/css';
import 'swiper/css/pagination';

interface Collection {
  id: string;
  _id?: string;
  slug: string;
  name: string;
}

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
  const [products, setProducts] = useState<Product[]>([]); // Không cần productsWithCollectionName nữa
  // const [collections, setCollections] = useState<Collection[]>([]); // Không cần thiết nữa
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchProducts({
          isFeatured: true, // Chỉ lấy sản phẩm nổi bật
          status: 'active', // Chỉ lấy sản phẩm đang hoạt động
          sortBy: 'createdAt', // Sắp xếp theo ngày tạo
          sortOrder: 'desc', // Mới nhất trước
          limit: 15,
        });

        setProducts(productData.products);

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
            <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
              Nổi bật
            </p>
            <h2 className="text-[clamp(20px,3.5vw,38px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[1.5px] sm:tracking-[2px] m-0">
              TOP SẢN PHẨM NỔI BẬT
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-[#c4a84f] to-transparent mt-3.5" />
          </div>
          <Link
            href="/products/all"
            className="text-[12px] text-[#8b6914] no-underline tracking-[2px] uppercase border border-[#c4a84f] px-6 py-2.5 transition-all hover:bg-[#c4a84f] hover:text-white font-['Cormorant_Garamond',_serif]"
          >
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            }
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1.5}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom', // Sử dụng một element tùy chỉnh cho pagination
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 16 },
              640: { slidesPerView: 2.5, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="!pb-12" // Thêm padding-bottom để chứa pagination
          >
            {products.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* Custom Pagination container */}
        <div className="swiper-pagination-custom flex justify-center mt-6 gap-2" />
      </div>
      <style jsx global>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: #d1c0a2;
          opacity: 0.6;
          transition: all 0.2s ease;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background-color: #c4a84f;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
