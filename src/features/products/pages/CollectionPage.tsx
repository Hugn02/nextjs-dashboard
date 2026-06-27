"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    bannerImage?: string;
}

interface CollectionsPageProps {
    slug: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [imgError2, setImgError2] = useState(false);

    const firstImage =
        !imgError && product.images?.[0]
            ? product.images[0]
            : `https://placehold.co/400x400/faf7f2/c4a84f?text=${encodeURIComponent(product.name.slice(0, 12))}`;

    const secondImage = !imgError2 && product.images?.[1] ? product.images[1] : null;

    return (
        <div
            className="group flex cursor-pointer flex-col overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Ảnh sản phẩm */}
            <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
                <Link href={`/products/${product.slug}`}>
                    <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className={`object-cover transition-all duration-300 ease-in-out ${hovered ? "scale-105" : "scale-100"} ${hovered && secondImage ? "opacity-0" : "opacity-100"}`}
                        onError={() => setImgError(true)}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {secondImage && (
                        <Image
                            src={secondImage}
                            alt={`${product.name} - ảnh 2`}
                            fill
                            className={`object-cover transition-all duration-300 ease-in-out ${hovered ? "scale-105 opacity-100" : "scale-100 opacity-0"}`}
                            onError={() => setImgError2(true)}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            priority={false} // Ảnh thứ 2 không cần ưu tiên tải
                        />
                    )}
                </Link>

                {/* Badge góc trên trái */}
                {product.badge && (
                    <span
                        className="absolute top-2.5 left-2.5 rounded-[2px] px-2.5 py-1 text-[11px] font-bold text-white"
                        style={{ background: product.isContact ? "#8b6914" : "#c4a84f", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: 0.5 }}
                    >
                        {product.badge}
                    </span>
                )}

                {/* Quick-add hover */}
                <div className="absolute inset-0 bg-transparent transition-colors duration-300 group-hover:bg-[rgba(30,15,0,0.06)]" />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex flex-1 flex-col gap-1 p-[14px_14px_16px]">
                {/* Tên collection nhỏ */}
                {product.collection && (
                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-[10px] uppercase tracking-[1.5px] text-[#c4a84f]">
                        {product.collection}
                    </p>
                )}

                {/* Tên sản phẩm */}
                <Link href={`/products/${product.slug}`} className="no-underline">
                    <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 overflow-hidden text-[13px] font-semibold leading-[1.5] text-[#2c1a00] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {product.name}
                    </h3>
                </Link>

                {/* Giá */}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    {product.isContact ? (
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-sm font-bold text-[#8b6914]">
                            Liên hệ
                        </span>
                    ) : (
                        <>
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[15px] font-bold text-[#8b2500]">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs text-[#aaa] line-through">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Nút hành động */}
            <div className="px-[14px] pb-[14px]">
                {product.isContact ? (
                    <button
                        className="w-full cursor-pointer rounded-[2px] border border-[#c4a84f] bg-white py-2.5 text-[11px] font-bold uppercase text-[#8b6914] transition-all duration-200 hover:bg-[#c4a84f] hover:text-white"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: 1.5 }}
                    >
                        Liên hệ đặt hàng
                    </button>
                ) : (
                    <button
                        className="w-full cursor-pointer rounded-[2px] border-none bg-[#c4a84f] py-2.5 text-[11px] font-bold uppercase text-white transition-colors duration-200 hover:bg-[#a8893a]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: 1.5 }}
                    >
                        Thêm vào giỏ hàng
                    </button>
                )}
            </div>
        </div>
    );
}

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
const filterSections = [
    "Bộ sưu tập",
    "Phong cách thiết kế",
    "Chất liệu",
    "Loại sản phẩm",
    "Sản phẩm lẻ/Bộ",
    "Mục đích sử dụng",
    "Khoảng giá",
];
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CollectionsPage({ slug }: CollectionsPageProps) {
    console.log("slug received:", slug); // DEBUG: Kiểm tra slug nhận được
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("productName-asc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch category info
    useEffect(() => {
        if (!slug) return; // Chỉ fetch khi có slug

        // Thay vì giả lập category, ta sẽ fetch toàn bộ danh sách và tìm category hiện tại
        const fetchCategory = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!res.ok) throw new Error('Failed to fetch categories');

                const categories: Category[] = await res.json();
                const currentCategory = categories.find(cat => cat.slug === slug);

                if (currentCategory) {
                    setCategory(currentCategory);
                } else {
                    // Fallback nếu không tìm thấy, vẫn hiển thị slug để debug
                    setCategory({ _id: slug, name: slug.replace(/-/g, " ").toUpperCase(), slug: slug });
                }
            } catch (err) {
                console.error("Lỗi fetch category:", err);
            }
        };
        fetchCategory();
    }, [slug]);

    // Fetch products theo slug
    useEffect(() => {
        if (!slug) return; // Chỉ fetch khi có slug

        const loadProducts = async () => {
            setLoading(true);
            const [sortField, sortDirection] = sortBy.split('-');

            try {
                const { products, totalCount } = await fetchProducts({
                    category: slug,
                    sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                    sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                    limit: 20,
                    status: 'active'
                });

                setProducts(products);
                setTotalCount(totalCount);
            } catch (err) {
                console.error("Lỗi fetch products:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [slug, sortBy]);

    const categoryName = category?.name || (slug || "").replace(/-/g, " ").toUpperCase();

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
            `}</style>

            {/* ── Banner ảnh collection ─────────────────────────────── */}
            <div className="relative mt-[120px] h-[420px] w-full overflow-hidden">
                <Image
                    src={category?.bannerImage || "https://theme.hstatic.net/200000296482/1001063914/14/collection_banner.jpg?v=6037"}
                    alt={categoryName}
                    fill
                    className="object-cover object-center"
                    priority
                />

                {/* Overlay tối hơn một chút để tạo cảm giác sang trọng */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

                {/* Optional: Lớp overlay gradient nhẹ từ dưới lên nếu cần chữ */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /> */}
            </div>


            {/* ── Main content ─────────────────────────────────────── */}
            {/* Banner luôn hiển thị nên không cần margin top ở đây nữa */}
            <main className="min-h-[80vh] bg-white pb-20 mt-0">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Breadcrumb */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-6 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline">
                            Trang chủ
                        </Link>
                        <span className="mx-2">›</span>
                        <Link href="/collections" className="text-[#888] no-underline">
                            Các bộ sưu tập
                        </Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00]">{categoryName}</span>
                    </nav>

                    {/* Tiêu đề danh mục */}
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
                        {categoryName}
                    </h1>

                    {/* Toolbar: đếm SP + bộ lọc + sắp xếp */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8d6] pb-4">
                        {/* Đếm sản phẩm */}
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center gap-4">
                            {/* Nút bộ lọc */}
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="font-['Cormorant_Garamond',_Georgia,_serif] flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#ddd] bg-none px-4 py-2 text-[13px] text-[#3d2b00] transition-colors hover:border-[#c4a84f]"
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c4a84f")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ddd")}
                            >
                                <span>Bộ lọc</span>
                                <span className="text-[10px]">⇅</span>
                            </button>

                            {filterOpen && (
                                <div className="absolute top-full left-0 z-[999] mt-2 w-[200px] border border-[#e5e5e5] bg-white shadow-[0_8px_25px_rgba(0,0,0,.15)]">
                                    {filterSections.map((title) => (
                                        <div
                                            key={title}
                                            className="flex cursor-pointer justify-between border-b border-[#eee] px-4 py-3"
                                        >
                                            <span
                                                className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] uppercase text-[#3d2b00]"
                                            >
                                                {title}
                                            </span>

                                            <span className="text-[#3d2b00]">+</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Sắp xếp */}
                            <div className="flex items-center gap-2">
                                <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">
                                    Sắp xếp:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="font-['Cormorant_Garamond',_Georgia,_serif] min-w-[140px] cursor-pointer rounded-[2px] border border-[#ddd] bg-white px-3 py-2 text-[13px] text-[#3d2b00] outline-none"

                                >
                                    <option value="productName-asc">Tên: A-Z</option>
                                    <option value="productName-desc">Tên: Z-A</option>
                                    <option value="newPrice-asc">Giá: Thấp → Cao</option>
                                    <option value="newPrice-desc">Giá: Cao → Thấp</option>
                                    <option value="newest">Mới nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* Grid sản phẩm */}
                    {loading ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty state */
                        <div className="py-20 text-center">
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa]">
                                Chưa có sản phẩm trong danh mục này
                            </p>
                            <Link
                                href="/collections"
                                className="font-['Cormorant_Garamond',_Georgia,_serif] mt-5 inline-block rounded-[2px] bg-[#c4a84f] px-8 py-3 text-[13px] uppercase tracking-[2px] text-white no-underline"
                            >
                                Xem tất cả bộ sưu tập
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
