"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ModalWrapper from "@/src/components/ui/ModalWrapper";
import { useSearch } from "../hooks/useSearch";

const POPULAR_TAGS = ["Bộ ấm trà", "Bình hoa", "Bộ bát đĩa", "Sứ trắng", "Quà tặng"];

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { products, totalCount, isLoading, error } = useSearch(query);

  // Tự focus vào input khi mở
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    if (inputRef.current) inputRef.current.value = tag;
  };

  const handleViewAll = () => {
    if (!query.trim()) return;
    onClose();
    router.push(`/search?name=${encodeURIComponent(query.trim())}`);
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      handleViewAll();
    }
  };

  const showResults = query.trim().length >= 2;

  return (
    <ModalWrapper title="Tìm kiếm sản phẩm" onClose={onClose} width={520}>
      <p className="text-center text-xs md:text-sm text-[#666] mb-4 md:mb-6 font-['Cormorant_Garamond',_serif]">
        Nhập tên sản phẩm hoặc bộ sưu tập:
      </p>

      {/* Ô tìm kiếm */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          defaultValue={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-[12px_50px_12px_15px] md:p-[16px_54px_16px_18px] text-[14px] md:text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
        />
        <button
          onClick={handleViewAll}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[18px] text-[#c4a84f] p-1 hover:scale-110 transition-transform"
          title="Tìm kiếm"
        >
          🔍
        </button>
      </div>

      {/* Kết quả tìm kiếm */}
      {showResults ? (
        <div>
          {/* Loading */}
          {isLoading && (
            <div className="py-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-[13px] text-[#aaa] font-['Cormorant_Garamond',_serif]">
                Đang tìm kiếm…
              </p>
            </div>
          )}

          {/* Lỗi */}
          {!isLoading && error && (
            <p className="py-4 text-center text-[13px] text-red-400">{error}</p>
          )}

          {/* Không có kết quả */}
          {!isLoading && !error && products.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[32px] mb-2">🔍</p>
              <p className="text-[14px] text-[#aaa] font-['Cormorant_Garamond',_serif]">
                Không tìm thấy sản phẩm nào cho&nbsp;
                <span className="text-[#2c1a00] font-semibold">"{query}"</span>
              </p>
            </div>
          )}

          {/* Danh sách sản phẩm */}
          {!isLoading && !error && products.length > 0 && (
            <>
              <ul className="divide-y divide-[#f0e8d6] mb-3">
                {products.map((product, idx) => {
                  const imgSrc =
                    product.images?.[0] ||
                    `https://placehold.co/60x60/faf7f2/c4a84f?text=${encodeURIComponent(
                      product.name.slice(0, 6)
                    )}`;
                  return (
                    <li key={product._id || product.id || idx}>
                      <button
                        onClick={() => handleProductClick(product.slug)}
                        className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-[#fdf8ef] rounded-lg transition-colors group cursor-pointer border-none bg-transparent"
                      >
                        {/* Ảnh */}
                        <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden border border-[#ede0c4] bg-[#faf7f2]">
                          <Image
                            src={imgSrc}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://placehold.co/60x60/faf7f2/c4a84f?text=SP`;
                            }}
                          />
                        </div>

                        {/* Thông tin */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] md:text-[14px] font-semibold text-[#c4a84f] group-hover:text-[#a8893a] font-['Cormorant_Garamond',_serif] leading-snug line-clamp-1">
                            {product.name}
                          </p>
                          {product.brandName && (
                            <p className="text-[11px] text-[#999] font-['Cormorant_Garamond',_serif] mt-0.5 line-clamp-1">
                              {product.brandName}
                            </p>
                          )}
                          <p className="text-[13px] font-bold text-[#8b2500] mt-1 font-['Cormorant_Garamond',_serif]">
                            {product.isContact ? "Liên hệ" : formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Arrow */}
                        <span className="text-[#c4a84f] text-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          ›
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Nút Xem thêm */}
              <button
                onClick={handleViewAll}
                className="w-full py-3.5 border-t border-[#f0e8d6] text-center text-[13px] md:text-[14px] font-['Cormorant_Garamond',_serif] font-semibold text-[#8b6914] hover:bg-[#fdf8ef] transition-colors cursor-pointer bg-transparent border-x-0 border-b-0 uppercase tracking-[1px]"
              >
                Xem thêm {totalCount} sản phẩm →
              </button>
            </>
          )}
        </div>
      ) : (
        /* Tags phổ biến khi chưa nhập */
        <div>
          <p className="text-[12px] text-[#aaa] tracking-[1px] uppercase mb-2.5 font-sans">
            Tìm kiếm phổ biến
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                className="px-3 md:px-3.5 py-1 md:py-1.5 border border-[#e0d0b0] rounded-[20px] bg-[#fdf8ef] text-[#8b6914] text-[12px] md:text-[13px] cursor-pointer font-['Cormorant_Garamond',_serif] transition-all duration-200 hover:bg-[#c4a84f] hover:text-white hover:border-[#c4a84f]"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
