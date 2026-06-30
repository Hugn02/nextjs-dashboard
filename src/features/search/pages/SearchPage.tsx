"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { searchProducts } from "../services/search.service";
import { Product } from "../../products/types/product.type";
import ProductCard from "../../products/components/ProductCard";

const PAGE_SIZE = 10;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white">
      <div className="aspect-square animate-pulse bg-[#f0e8d6]" />
      <div className="p-3.5">
        <div className="mb-2 h-2.5 w-2/5 rounded bg-[#f0e8d6]" />
        <div className="mb-1.5 h-3 rounded bg-[#f0e8d6]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#f0e8d6]" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nameParam = searchParams.get("name") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(nameParam);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const doSearch = useCallback(
    async (name: string, page: number) => {
      if (!name.trim()) return;
      setLoading(true);
      try {
        const result = await searchProducts({ name: name.trim(), page, limit: PAGE_SIZE });
        setProducts(result.products);
        setTotalCount(result.totalCount);
      } catch {
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setInputValue(nameParam);
    doSearch(nameParam, pageParam);
  }, [nameParam, pageParam, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.push(`/search?name=${encodeURIComponent(inputValue.trim())}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`/search?name=${encodeURIComponent(nameParam)}&page=${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-[80vh] bg-white pb-20 mt-[100px] md:mt-[130px]">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">

        {/* Breadcrumb */}
        <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-6 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
          <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#2c1a00]">Tìm kiếm</span>
        </nav>

        {/* Tiêu đề */}
        <h1
          className="font-['Cormorant_Garamond',_Georgia,_serif] text-center font-light uppercase tracking-[3px] text-[#2c1a00] mb-3"
          style={{ fontSize: "clamp(22px, 3vw, 32px)" }}
        >
          Tìm kiếm
        </h1>

        {/* Đếm kết quả */}
        {nameParam && !loading && (
          <p className="text-center text-[13px] text-[#888] font-['Cormorant_Garamond',_serif] mb-6">
            Có&nbsp;
            <span className="text-[#c4a84f] font-semibold">{totalCount}</span>
            &nbsp;sản phẩm cho tìm kiếm
          </p>
        )}

        {/* Form tìm kiếm */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-[560px] mx-auto mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 px-4 py-3 border border-[#ddd] rounded-lg text-[14px] outline-none focus:border-[#c4a84f] transition-colors font-['Cormorant_Garamond',_serif] text-[#333]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#c4a84f] text-white rounded-lg text-[13px] font-bold uppercase tracking-[1.5px] font-['Cormorant_Garamond',_serif] hover:bg-[#a8893a] transition-colors cursor-pointer border-none"
          >
            Tìm
          </button>
        </form>

        {/* Nhãn kết quả */}
        {nameParam && !loading && products.length > 0 && (
          <p className="text-[14px] text-[#555] font-['Cormorant_Garamond',_serif] mb-6">
            Kết quả tìm kiếm cho{" "}
            <span className="font-bold text-[#2c1a00]">"{nameParam}"</span>.
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Không có kết quả */}
        {!loading && nameParam && products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[40px] mb-3">🔍</p>
            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa] mb-2">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="text-[13px] text-[#bbb] mb-6">
              Thử tìm với từ khoá khác hoặc duyệt theo bộ sưu tập
            </p>
            <Link
              href="/collections"
              className="font-['Cormorant_Garamond',_Georgia,_serif] inline-block rounded-[2px] bg-[#c4a84f] px-8 py-3 text-[13px] uppercase tracking-[2px] text-white no-underline hover:bg-[#a8893a] transition-colors"
            >
              Xem tất cả bộ sưu tập
            </Link>
          </div>
        )}

        {/* Chưa có query */}
        {!loading && !nameParam && (
          <div className="py-20 text-center">
            <p className="text-[40px] mb-3">🔍</p>
            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa]">
              Nhập từ khoá để bắt đầu tìm kiếm
            </p>
          </div>
        )}

        {/* Grid sản phẩm */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-10">
              {products.map((p, idx) => (
                <ProductCard key={p._id || p.id || idx} product={p} />
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* Trang trước */}
                <button
                  disabled={pageParam <= 1}
                  onClick={() => handlePageChange(pageParam - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-[2px] border border-[#ddd] text-[#666] hover:border-[#c4a84f] hover:text-[#c4a84f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white font-['Cormorant_Garamond',_serif] text-lg"
                >
                  ‹
                </button>

                {/* Số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= pageParam - 2 && p <= pageParam + 2)
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-[#aaa] text-[13px]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-[2px] border text-[13px] font-['Cormorant_Garamond',_serif] transition-colors cursor-pointer ${item === pageParam
                            ? "bg-[#c4a84f] border-[#c4a84f] text-white font-bold"
                            : "border-[#ddd] text-[#666] bg-white hover:border-[#c4a84f] hover:text-[#c4a84f]"
                          }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                {/* Trang sau */}
                <button
                  disabled={pageParam >= totalPages}
                  onClick={() => handlePageChange(pageParam + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-[2px] border border-[#ddd] text-[#666] hover:border-[#c4a84f] hover:text-[#c4a84f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white font-['Cormorant_Garamond',_serif] text-lg"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
