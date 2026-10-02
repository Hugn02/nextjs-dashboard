"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import Image from "next/image";
import ProductFilter, { ActiveFilters } from "../components/ProductFilter";
import ProductSortDropdown from "../components/ProductSortDropdown";
import { useProductFilterOptions } from "../hooks/useProductFilterOptions";

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
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Filters hook & local state
    const { collections, categories, functions } = useProductFilterOptions();
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);

    const LIMIT = 24;

    // Fetch thông tin category theo slug
    useEffect(() => {
        if (!slug) return;
        const fetchCategory = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!res.ok) throw new Error('Failed to fetch categories');
                const responseData = await res.json();
                const allCats: Category[] = Array.isArray(responseData) ? responseData : responseData.data || [];
                const current = allCats.find((cat) => cat.slug === slug);
                if (current) {
                    setCategoryInactive(current.isActive === false);
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

    // Fetch sản phẩm theo category slug + bộ lọc đang chọn
    useEffect(() => {
        if (!slug) return;
        const loadProducts = async () => {
            setPage(1); // Reset page to 1 on any filter change
            setLoading(true);
            const [sortField, sortDirection] = sortBy.split('-');
            try {
                const { products: fetchedProducts, totalCount: count } = await fetchProducts({
                    category: slug,
                    collection: selectedCollection || undefined,
                    function: selectedFunction || undefined,
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
    }, [slug, sortBy, selectedCollection, selectedFunction, priceRange]);

    const handleLoadMore = async () => {
        if (loadingMore || products.length >= totalCount) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const [sortField, sortDirection] = sortBy.split('-');

        try {
            const { products: fetchedProducts } = await fetchProducts({
                category: slug,
                collection: selectedCollection || undefined,
                function: selectedFunction || undefined,
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

    const categoryName = category?.name || (slug || "").replace(/-/g, " ").toUpperCase();
    const categoryBanner = "/assets/category2.png";

    const hasActiveFilters = selectedCollection !== null || selectedFunction !== null || priceRange !== null;

    const clearAllFilters = () => {
        setSelectedCollection(null);
        setSelectedFunction(null);
        setPriceRange(null);
    };

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
                .filter-accordion-content {
                    animation: filterFadeIn 0.18s ease-out;
                }
                @keyframes filterFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ── Page Header thanh lịch (Minimal Luxury) ── */}
            <div className="mt-[88px] md:mt-[120px] bg-[#faf7f2] border-b border-[#ede0c4] py-8 sm:py-10">
                <div className="mx-auto max-w-[1280px] px-6 text-center">
                    {/* Breadcrumb */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-3 text-xs tracking-wider text-[#8b6914] flex items-center justify-center gap-2">
                        <Link href="/" className="text-[#888] hover:text-[#c4a84f] transition-colors no-underline">Trang chủ</Link>
                        <span className="text-[#ccc]">›</span>
                        <Link href="/categories" className="text-[#888] hover:text-[#c4a84f] transition-colors no-underline">Loại sản phẩm</Link>
                        <span className="text-[#ccc]">›</span>
                        <span className="text-[#2c1a00] font-semibold">{categoryName}</span>
                    </nav>

                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs sm:text-sm tracking-[3px] text-[#8b6914] uppercase mb-1.5 font-medium">
                        Bát Tràng • Danh Mục Sản Phẩm
                    </p>

                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-[#2c1a00] font-normal uppercase tracking-[2px] sm:tracking-[3px] text-[clamp(24px,3.5vw,36px)]">
                        {categoryName}
                    </h1>

                    <div className="w-12 h-px bg-[#c4a84f] mx-auto my-3" />

                    {category?.description && (
                        <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#6b5840] text-sm sm:text-base italic max-w-xl mx-auto m-0 leading-relaxed font-light">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            <main className="min-h-[80vh] bg-white pb-20 pt-6">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Active filter tags */}
                    <ActiveFilters
                        categories={categories}
                        collections={collections}
                        functions={functions}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                        selectedFunction={selectedFunction}
                        setSelectedFunction={setSelectedFunction}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        clearAllFilters={clearAllFilters}
                    />

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs sm:text-[14px] text-[#888]">
                            {loading ? "Đang tải..." : `Hiển thị ${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                            {/* Nút bộ lọc & Dropdown */}
                            <ProductFilter
                                categories={categories}
                                collections={collections}
                                functions={functions}
                                selectedCollection={selectedCollection}
                                setSelectedCollection={setSelectedCollection}
                                selectedFunction={selectedFunction}
                                setSelectedFunction={setSelectedFunction}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                currentCategorySlug={slug}
                                showUnimplementedSections={true}
                            />

                            {/* Sắp xếp */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">Sắp xếp:</span>
                                <ProductSortDropdown
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={sortOptions}
                                />
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
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa] mb-3">
                                {hasActiveFilters ? "Không tìm thấy sản phẩm phù hợp với bộ lọc đã chọn" : "Chưa có sản phẩm trong danh mục này"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="font-['Cormorant_Garamond',_Georgia,_serif] mt-2 inline-block rounded-[2px] border border-[#c4a84f] px-6 py-2.5 text-[12px] uppercase tracking-[2px] text-[#8b6914] no-underline hover:bg-[#c4a84f] hover:text-white transition-all cursor-pointer bg-transparent"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                            <Link
                                href="/"
                                className="font-['Cormorant_Garamond',_Georgia,_serif] mt-5 inline-block rounded-[2px] bg-[#c4a84f] px-8 py-3 text-[13px] uppercase tracking-[2px] text-white no-underline hover:bg-[#a8893d] transition-colors ml-3"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {products.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
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
