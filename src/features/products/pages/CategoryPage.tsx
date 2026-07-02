"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import Image from "next/image";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    bannerImage?: string;
    image?: string;
    isActive?: boolean;
}

interface CategoryPageProps {
    slug: string;
}

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white">
            <div className="aspect-square animate-pulse bg-[#f0e8d6]" />
            <div className="p-3.5">
                <div className="mb-2 h-2.5 w-2/5 rounded bg-[#f0e8d6]" />
                <div className="mb-1.5 h-3 rounded bg-[#f0e8d6]" />
                <div className="mb-1.5 h-3 w-4/5 rounded bg-[#f0e8d6]" />
                <div className="mt-3 h-4 w-1/2 rounded bg-[#f0e8d6]" />
            </div>
        </div>
    );
}

const sortOptions = [
    { value: "productName-asc", label: "Tên: A-Z" },
    { value: "productName-desc", label: "Tên: Z-A" },
    { value: "newPrice-asc", label: "Giá: Thấp → Cao" },
    { value: "newPrice-desc", label: "Giá: Cao → Thấp" },
    { value: "newest", label: "Mới nhất" },
];

export default function CategoryPage({ slug }: CategoryPageProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [categoryInactive, setCategoryInactive] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("productName-asc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch category info by slug
    useEffect(() => {
        if (!slug) return;

        const fetchCategory = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!res.ok) throw new Error('Failed to fetch categories');

                const responseData = await res.json();
                const categories: Category[] = Array.isArray(responseData) ? responseData : responseData.data || [];
                const current = categories.find((cat) => cat.slug === slug);

                if (current) {
                    if (current.isActive === false) {
                        setCategoryInactive(true);
                    } else {
                        setCategoryInactive(false);
                    }
                    setCategory(current);
                } else {
                    setCategory({ _id: slug, name: slug.replace(/-/g, " ").toUpperCase(), slug });
                }
            } catch (err) {
                console.error("Lỗi fetch category:", err);
            }
        };
        fetchCategory();
    }, [slug]);

    // Fetch products by category slug
    useEffect(() => {
        if (!slug) return;

        const loadProducts = async () => {
            setLoading(true);
            const [sortField, sortDirection] = sortBy.split('-');

            try {
                const { products: fetchedProducts, totalCount: count } = await fetchProducts({
                    category: slug,
                    sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                    sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                    limit: 20,
                    status: 'active'
                });
                setProducts(fetchedProducts);
                setTotalCount(count);
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
    const categoryBanner = "/assets/category.jpg";

    if (categoryInactive) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center mt-[88px]">
                <div className="text-center max-w-md px-6 py-16">
                    <div className="text-6xl mb-6">🚫</div>
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-light text-[#2c1a00] tracking-[2px] mb-3 uppercase">
                        {categoryName}
                    </h1>
                    <p className="text-[#888] text-sm leading-relaxed mb-8 font-['Cormorant_Garamond',_Georgia,_serif]">
                        Danh mục này hiện không còn hoạt động.<br />
                        Vui lòng khám phá các sản phẩm khác của chúng tôi.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-[#c4a84f] text-white px-8 py-3 text-xs uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] no-underline hover:bg-[#a8893d] transition-colors"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
            `}</style>

            {/* Banner */}
            <div className="relative mt-[120px] h-[420px] w-full overflow-hidden hidden lg:block">
                <Image
                    src={categoryBanner}
                    alt={categoryName}
                    fill
                    className="object-cover object-top"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
            </div>

            <main className="min-h-[80vh] bg-white pb-20 mt-[120px] lg:mt-0">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Breadcrumb */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-6 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline">Trang chủ</Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#888]">Loại sản phẩm</span>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00]">{categoryName}</span>
                    </nav>

                    {/* Tiêu đề */}
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
                        {categoryName}
                    </h1>

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center gap-4">
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="font-['Cormorant_Garamond',_Georgia,_serif] flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#ddd] bg-none px-4 py-2 text-[13px] text-[#3d2b00] transition-colors hover:border-[#c4a84f]"
                            >
                                <span>Bộ lọc</span>
                                <span className="text-[10px]">⇅</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="font-['Cormorant_Garamond',_Georgia,_serif] min-w-[140px] cursor-pointer rounded-[2px] border border-[#ddd] bg-white px-3 py-2 text-[13px] text-[#3d2b00] outline-none"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid sản phẩm */}
                    {loading ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa]">
                                Chưa có sản phẩm trong danh mục này
                            </p>
                            <Link
                                href="/"
                                className="font-['Cormorant_Garamond',_Georgia,_serif] mt-5 inline-block rounded-[2px] bg-[#c4a84f] px-8 py-3 text-[13px] uppercase tracking-[2px] text-white no-underline"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {products.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
