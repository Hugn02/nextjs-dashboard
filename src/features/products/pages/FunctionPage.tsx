"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import Image from "next/image";
import ProductFilter, { ActiveFilters } from "../components/ProductFilter";
import { useProductFilterOptions } from "../hooks/useProductFilterOptions";

interface ProductFunction {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

interface FunctionPageProps {
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

export default function FunctionPage({ slug }: FunctionPageProps) {
    const [func, setFunc] = useState<ProductFunction | null>(null);
    const [funcInactive, setFuncInactive] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("productName-asc");
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Filters hook & local state
    const { collections, categories } = useProductFilterOptions();
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);

    const LIMIT = 24;

    // Fetch function details by slug
    useEffect(() => {
        if (!slug) return;
        const fetchFunctionDetails = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/functions`);
                if (!res.ok) throw new Error('Failed to fetch functions');
                const responseData = await res.json();
                const allFuncs: ProductFunction[] = Array.isArray(responseData) ? responseData : responseData.data || [];
                const current = allFuncs.find((f) => f.slug === slug);
                if (current) {
                    setFuncInactive(current.isActive === false);
                    setFunc(current);
                } else {
                    setFunc({ _id: slug, name: slug.replace(/-/g, " ").toUpperCase(), slug });
                }
            } catch (err) {
                console.error("Lỗi fetch function details:", err);
            }
        };
        fetchFunctionDetails();
    }, [slug]);

    // Fetch products filtered by function slug + selected filters
    useEffect(() => {
        if (!slug) return;
        const loadProducts = async () => {
            setPage(1); // Reset page
            setLoading(true);
            const [sortField, sortDirection] = sortBy.split('-');
            try {
                const { products: fetchedProducts, totalCount: count } = await fetchProducts({
                    function: slug,
                    category: selectedCategory || undefined,
                    collection: selectedCollection || undefined,
                    minPrice: priceRange?.min,
                    maxPrice: priceRange?.max,
                    sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                    sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                    limit: LIMIT,
                    page: 1,
                    status: 'active',
                });
                setProducts(fetchedProducts);
                setTotalCount(count);
            } catch (err) {
                console.error("Lỗi fetch products:", err);
                setProducts([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [slug, sortBy, selectedCollection, selectedCategory, priceRange]);

    const handleLoadMore = async () => {
        if (loadingMore || products.length >= totalCount) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const [sortField, sortDirection] = sortBy.split('-');

        try {
            const { products: fetchedProducts } = await fetchProducts({
                function: slug,
                category: selectedCategory || undefined,
                collection: selectedCollection || undefined,
                minPrice: priceRange?.min,
                maxPrice: priceRange?.max,
                sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                limit: LIMIT,
                page: nextPage,
                status: 'active',
                });
            setProducts(prev => [...prev, ...fetchedProducts]);
            setPage(nextPage);
        } catch (err) {
            console.error("Lỗi fetch more products:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const functionName = func?.name || (slug || "").replace(/-/g, " ").toUpperCase();
    const bannerImage = "/assets/category2.png";

    const hasActiveFilters = selectedCollection !== null || selectedCategory !== null || priceRange !== null;

    const clearAllFilters = () => {
        setSelectedCollection(null);
        setSelectedCategory(null);
        setPriceRange(null);
    };

    if (funcInactive) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center mt-[88px]">
                <div className="text-center max-w-md px-6 py-16">
                    <div className="text-6xl mb-6">🚫</div>
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-light text-[#2c1a00] tracking-[2px] mb-3 uppercase">
                        {functionName}
                    </h1>
                    <p className="text-[#888] text-sm leading-relaxed mb-8 font-['Cormorant_Garamond',_Georgia,_serif]">
                        Chức năng này hiện không hoạt động.<br />
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
                .filter-accordion-content {
                    animation: filterFadeIn 0.18s ease-out;
                }
                @keyframes filterFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Banner */}
            <div className="relative mt-[120px] h-[420px] w-full overflow-hidden hidden lg:block">
                <Image
                    src={bannerImage}
                    alt={functionName}
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
            </div>

            <main className="min-h-[80vh] bg-white pb-20 mt-[120px] lg:mt-0">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Breadcrumb */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-6 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">Trang chủ</Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#888]">Chức năng</span>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00]">{functionName}</span>
                    </nav>

                    {/* Tiêu đề */}
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
                        {functionName}
                    </h1>

                    {/* Active filter tags */}
                    <ActiveFilters
                        categories={categories}
                        collections={collections}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        clearAllFilters={clearAllFilters}
                    />

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center gap-4">
                            {/* Nút bộ lọc & Dropdown */}
                            <ProductFilter
                                categories={categories}
                                collections={collections}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                selectedCollection={selectedCollection}
                                setSelectedCollection={setSelectedCollection}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                            />

                            {/* Sắp xếp */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="font-['Cormorant_Garamond',_Georgia,_serif] cursor-pointer rounded-[2px] border border-[#ddd] px-3 py-2 text-[13px] text-[#3d2b00] outline-none hover:border-[#c4a84f] bg-white transition-colors"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        Sắp xếp: {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <SkeletonCard key={idx} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="text-4xl mb-4">🏺</div>
                            <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] text-xl font-light text-[#2c1a00] uppercase tracking-wider mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-[#888] text-sm font-['Cormorant_Garamond',_Georgia,_serif]">Vui lòng thử điều chỉnh hoặc xóa bớt các bộ lọc đang chọn.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                            {products.map((product) => <ProductCard key={product._id || product.id} product={product} />)}
                        </div>
                    )}

                    {/* Load More Button */}
                    {!loading && products.length > 0 && products.length < totalCount && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="font-['Cormorant_Garamond',_Georgia,_serif] cursor-pointer rounded-[2px] border border-[#c4a84f] bg-white px-8 py-3 text-xs uppercase tracking-[2px] text-[#8b6914] transition-all hover:bg-[#c4a84f] hover:text-white disabled:opacity-50"
                            >
                                {loadingMore ? "Đang tải..." : "Xem thêm sản phẩm"}
                            </button>
                        </div>
                    )}



                </div>
            </main>
        </>
    );
}
