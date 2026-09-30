"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import ProductFilter, { ActiveFilters } from "../components/ProductFilter";
import ProductSortDropdown from "../components/ProductSortDropdown";
import { useProductFilterOptions } from "../hooks/useProductFilterOptions";

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
    { value: "newest", label: "Mới nhất" },
    { value: "productName-asc", label: "Tên: A-Z" },
    { value: "productName-desc", label: "Tên: Z-A" },
    { value: "newPrice-asc", label: "Giá: Thấp → Cao" },
    { value: "newPrice-desc", label: "Giá: Cao → Thấp" },
];

const LIMIT = 24;

export default function AllProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters hook & local state
    const { collections, categories, functions } = useProductFilterOptions();
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);

    // Load initial products when component mounts or sortBy/filters change
    useEffect(() => {
        const loadInitialProducts = async () => {
            setLoading(true);
            setPage(1);
            const [sortField, sortDirection] = sortBy.split('-');

            try {
                const { products: fetchedProducts, totalCount: count } = await fetchProducts({
                    category: selectedCategory || undefined,
                    collection: selectedCollection || undefined,
                    function: selectedFunction || undefined,
                    minPrice: priceRange?.min,
                    maxPrice: priceRange?.max,
                    sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                    sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                    limit: LIMIT,
                    page: 1,
                    status: 'active'
                });
                setProducts(fetchedProducts);
                setTotalCount(count);
            } catch (err) {
                console.error("Lỗi fetch initial products:", err);
                setProducts([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        loadInitialProducts();
    }, [sortBy, selectedCategory, selectedCollection, selectedFunction, priceRange]);

    // Load more products when button clicked
    const handleLoadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const [sortField, sortDirection] = sortBy.split('-');

        try {
            const { products: fetchedProducts } = await fetchProducts({
                category: selectedCategory || undefined,
                collection: selectedCollection || undefined,
                function: selectedFunction || undefined,
                minPrice: priceRange?.min,
                maxPrice: priceRange?.max,
                sortBy: sortField === 'newest' ? 'createdAt' : sortField,
                sortOrder: sortField === 'newest' ? 'desc' : (sortDirection as 'asc' | 'desc'),
                limit: LIMIT,
                page: nextPage,
                status: 'active'
            });

            setProducts(prev => [...prev, ...fetchedProducts]);
            setPage(nextPage);
        } catch (err) {
            console.error("Lỗi fetch more products:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const hasMore = products.length < totalCount;

    const clearAllFilters = () => {
        setSelectedCategory(null);
        setSelectedCollection(null);
        setSelectedFunction(null);
        setPriceRange(null);
    };

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

            {/* Header thanh lịch đồng bộ (Minimal Luxury) */}
            <div className="mt-[88px] md:mt-[120px] bg-[#faf7f2] border-b border-[#ede0c4] py-8 sm:py-12">
                <div className="mx-auto max-w-[1280px] px-6 text-center">
                    {/* Breadcrumbs */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-3 text-xs tracking-wider text-[#8b6914] flex items-center justify-center gap-2">
                        <Link href="/" className="text-[#888] hover:text-[#c4a84f] transition-colors no-underline">
                            Trang chủ
                        </Link>
                        <span className="text-[#ccc]">›</span>
                        <span className="text-[#2c1a00] font-semibold">Tất cả sản phẩm</span>
                    </nav>

                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs sm:text-sm tracking-[3px] text-[#8b6914] uppercase mb-2 font-medium">
                        Bát Tràng • Kiệt Tác Thủ Công
                    </p>

                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-[#2c1a00] font-normal uppercase tracking-[2px] sm:tracking-[4px] text-[clamp(24px,3.5vw,38px)]">
                        Tất Cả Sản Phẩm Gốm Sứ
                    </h1>

                    <div className="w-14 h-px bg-[#c4a84f] mx-auto my-3" />

                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#6b5840] text-sm sm:text-base italic max-w-2xl mx-auto m-0 leading-relaxed font-light">
                        Tuyển tập tác phẩm gốm sứ nghệ nhân tinh xảo, gìn giữ tinh hoa văn hóa truyền thống và nâng tầm không gian sống của bạn.
                    </p>
                </div>
            </div>

            <main className="min-h-[80vh] bg-white py-8 sm:py-12">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Active filter tags */}
                    <ActiveFilters
                        categories={categories}
                        collections={collections}
                        functions={functions}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                        selectedFunction={selectedFunction}
                        setSelectedFunction={setSelectedFunction}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        clearAllFilters={clearAllFilters}
                    />

                    {/* Toolbar */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[14px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center gap-4">
                            {/* Nút bộ lọc & Dropdown */}
                            <ProductFilter
                                categories={categories}
                                collections={collections}
                                functions={functions}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                selectedCollection={selectedCollection}
                                setSelectedCollection={setSelectedCollection}
                                selectedFunction={selectedFunction}
                                setSelectedFunction={setSelectedFunction}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                            />

                            {/* Sắp xếp */}
                            <div className="flex items-center gap-2">
                                <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">Sắp xếp:</span>
                                <ProductSortDropdown
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={sortOptions}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-lg tracking-wider text-[#aaa]">
                                Không có sản phẩm nào được tìm thấy
                            </p>
                            <Link
                                href="/"
                                className="font-['Cormorant_Garamond',_Georgia,_serif] mt-5 inline-block rounded-[2px] bg-[#c4a84f] px-8 py-3 text-[13px] uppercase tracking-[2px] text-white no-underline hover:bg-[#a8893d] transition-colors"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>

                            {/* Load More Button */}
                            {hasMore && (
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
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
