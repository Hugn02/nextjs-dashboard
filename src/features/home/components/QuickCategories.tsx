"use client";

import { useState, useEffect } from "react";

const CLOUDINARY_DOMAIN = 'https://res.cloudinary.com/dls9re0ux/image/upload/';

const resolveImageUrl = (image?: string) => {
  if (!image) return null;
  return image.startsWith('http') ? image : `${CLOUDINARY_DOMAIN}${image}`;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showOnHome?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export default function QuickCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const response = await res.json();
        // API có thể trả về mảng trực tiếp hoặc { data: [...] } hoặc { data: { categories: [...] } }
        const rawCategories = Array.isArray(response)
          ? response
          : (response.data?.categories || response.data || []);

        if (Array.isArray(rawCategories)) {
          setCategories(rawCategories);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Lọc và sắp xếp các danh mục hiển thị trên trang chủ
  const displayCategories = categories.length > 0
    ? categories
      .filter((cat) => cat.isActive !== false && cat.showOnHome === true)
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
    : [];

  // Nếu không có danh mục nào để hiển thị, không render gì cả
  if (!loading && displayCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white pt-10 md:pt-[60px] pb-10 mt-[88px] md:mt-0">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[15px] tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
            Khám phá
          </p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0">
            Bạn đang cần tìm gì?
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        {loading && categories.length === 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2.5 px-3 py-5 rounded border border-[#ede0c4] bg-[#fdfaf4] animate-pulse"
              >
                <div className="w-[100px] h-[100px] bg-[#ede0c4] rounded" />
                <div className="w-20 h-3 bg-[#ede0c4] rounded mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {displayCategories.map((cat) => (
              <a
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2.5 px-3 py-5 rounded border border-[#ede0c4] no-underline bg-[#fdfaf4] transition-all duration-[250ms] cursor-pointer hover:bg-[#fff8e8] hover:border-[#c4a84f] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(196,168,79,0.15)]"
              >
                <img
                  src={resolveImageUrl(cat.image) || `https://placehold.co/100x100/faf7f2/c4a84f?text=${encodeURIComponent(cat.name)}`}
                  alt={cat.name}
                  className="h-[100px] w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/100x100/faf7f2/c4a84f?text=${encodeURIComponent(cat.name)}`;
                  }}
                />
                <span className="text-[14px] md:text-[15px] text-[#3d2b00] font-['Cormorant_Garamond',_serif] font-semibold text-center leading-[1.4]">
                  {cat.name}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
