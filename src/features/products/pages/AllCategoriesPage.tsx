"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import VaseIcon from "@/src/components/ui/VaseIcon";
import SearchBar from "@/src/components/ui/SearchBar";
import ProductSortDropdown, { SortOption } from "@/src/features/products/components/ProductSortDropdown";
import { formatImageUrl } from "@/src/lib/cloudinary";

interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  isActive?: boolean;
  createdAt?: string;
  sortOrder?: number;
}

const sortOptions: SortOption[] = [
  { value: "name-asc", label: "Tên: A-Z" },
  { value: "name-desc", label: "Tên: Z-A" },
  { value: "newest", label: "Mới nhất" },
  { value: "default", label: "Thứ tự gốc" },
];

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
        const res = await fetch(`${apiUrl}/categories?isActive=true`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const list: CategoryItem[] = Array.isArray(data) ? data : data.data || [];
        setCategories(list.filter((c) => c.isActive !== false));
      } catch (err) {
        console.error("Lỗi fetch all categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        return (
          cat.name.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name, "vi");
        if (sortBy === "name-desc") return b.name.localeCompare(a.name, "vi");
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "default") {
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        }
        return 0;
      });
  }, [categories, searchTerm, sortBy]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
      `}</style>

      {/* Header thanh lịch (Minimal Luxury) */}
      <div className="mt-[88px] md:mt-[120px] bg-[#faf7f2] border-b border-[#ede0c4] py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          {/* Breadcrumbs */}
          <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-3 text-xs tracking-wider text-[#8b6914] flex items-center justify-center gap-2">
            <Link href="/" className="text-[#888] hover:text-[#c4a84f] transition-colors no-underline">
              Trang chủ
            </Link>
            <span className="text-[#ccc]">›</span>
            <span className="text-[#2c1a00] font-semibold">Loại sản phẩm</span>
          </nav>

          <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs sm:text-sm tracking-[3px] text-[#8b6914] uppercase mb-2 font-medium">
            Bát Tràng • Kiệt Tác Thủ Công
          </p>

          <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-[#2c1a00] font-normal uppercase tracking-[2px] sm:tracking-[4px] text-[clamp(24px,3.5vw,38px)]">
            Tất Cả Loại Sản Phẩm
          </h1>

          <div className="w-14 h-px bg-[#c4a84f] mx-auto my-3" />

          <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#6b5840] text-sm sm:text-base italic max-w-2xl mx-auto m-0 leading-relaxed font-light">
            Đa dạng các chủng loại gốm sứ phục vụ đời sống: từ ấm chén trà đạo, bát đĩa gia đình cho đến bình phong thủy và đồ thờ linh thiêng.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-[70vh] bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">

          {/* Thanh Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-5 mb-8 border-b border-[#f0e8d6]">
            {/* Desktop: Đếm số lượng (ở bên trái) */}
            <span className="hidden sm:inline-block font-['Cormorant_Garamond',_Georgia,_serif] text-sm sm:text-base text-[#7a6244] tracking-wide">
              Hiển thị <strong className="text-[#2c1a00] font-semibold">{filteredCategories.length}</strong> loại sản phẩm
            </span>

            {/* Tìm kiếm & Sắp xếp */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Ô tìm kiếm SearchBar */}
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tìm loại sản phẩm..."
                className="w-full sm:w-60"
              />

              {/* Hàng điều khiển phụ Mobile: Đếm số lượng (trái) + Sắp xếp (phải) */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <span className="sm:hidden font-['Cormorant_Garamond',_Georgia,_serif] text-xs text-[#7a6244] tracking-wide">
                  Hiển thị <strong className="text-[#2c1a00] font-semibold">{filteredCategories.length}</strong> loại sản phẩm
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888] whitespace-nowrap">
                    Sắp xếp:
                  </span>
                  <ProductSortDropdown
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lưới 4 cột thanh thoát */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[2px] border border-[#ede0c4] overflow-hidden bg-[#faf7f2] animate-pulse" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-xl text-[#888]">
                {searchTerm ? `Không tìm thấy loại sản phẩm nào khớp với "${searchTerm}"` : "Hiện chưa có danh mục sản phẩm nào."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs uppercase tracking-[2px] text-[#8b6914] border-b border-[#c4a84f] bg-transparent border-t-0 border-x-0 cursor-pointer font-['Cormorant_Garamond',_Georgia,_serif]"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredCategories.map((cat, idx) => {
                const catId = cat._id || cat.id || idx;
                const rawImg = cat.image || cat.bannerImage;
                const hasRealImage = Boolean(rawImg && rawImg.trim() !== "");
                const imgSrc = hasRealImage ? formatImageUrl(rawImg, { width: 500 }) : "";

                return (
                  <Link
                    key={catId}
                    href={`/categories/${cat.slug}`}
                    className="group relative flex flex-col aspect-[3/4] overflow-hidden rounded-[2px] border border-[#ede0c4] bg-[#2c1a00] no-underline shadow-[0_2px_8px_rgba(44,26,0,0.05)] hover:border-[#c4a84f] hover:shadow-[0_12px_32px_rgba(44,26,0,0.15)] hover:-translate-y-1 transition-all duration-300"
                  >
                    {hasRealImage ? (
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={imgSrc}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-colors duration-300" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f2] via-[#f3ecdd] to-[#e7dac5] flex flex-col items-center justify-center p-4 text-center transition-transform duration-700 ease-out group-hover:scale-105">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#c4a84f]/40 bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm mb-2.5 group-hover:border-[#c4a84f] group-hover:scale-110 transition-all duration-300">
                          <VaseIcon size={28} className="text-[#8b6914]" />
                        </div>
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] uppercase tracking-[2px] text-[#8b6914] font-semibold">
                          Bát Tràng
                        </span>
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[10px] text-[#9a7e58] italic tracking-wider">
                          Dòng gốm thủ công
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Tag nhỏ góc trên */}
                    <div className="relative z-10 p-3 sm:p-4">
                      <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[10px] sm:text-[11px] uppercase tracking-[1.5px] text-[#e8d5a3] bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 font-medium">
                        Danh mục #{idx + 1}
                      </span>
                    </div>

                    {/* Nội dung dưới chân card */}
                    <div className="relative z-10 mt-auto p-4 sm:p-5 flex flex-col">
                      <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg sm:text-xl text-white font-light m-0 mb-1.5 uppercase tracking-[1.5px] group-hover:text-[#f3e3a9] transition-colors line-clamp-1">
                        {cat.name}
                      </h2>

                      {cat.description && (
                        <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#dfcfb0] text-xs leading-relaxed line-clamp-2 m-0 mb-3 font-light italic hidden sm:block">
                          {cat.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[#c4a84f] text-[11px] uppercase tracking-[1.5px] font-['Cormorant_Garamond',_Georgia,_serif] font-semibold mt-1">
                        <span>Xem sản phẩm</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
