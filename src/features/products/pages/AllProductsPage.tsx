"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";

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

    // Load initial products when component mounts or sortBy changes
    useEffect(() => {
        const loadInitialProducts = async () => {
            setLoading(true);
            setPage(1);
            const [sortField, sortDirection] = sortBy.split('-');

            try {
                const { products: fetchedProducts, totalCount: count } = await fetchProducts({
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
    }, [sortBy]);

    // Load more products when button clicked
    const handleLoadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const [sortField, sortDirection] = sortBy.split('-');

        try {
            const { products: fetchedProducts } = await fetchProducts({
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
    const bannerImage = "/assets/category3.png";

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
            `}</style>

            {/* Banner */}
            <div className="relative mt-[120px] h-[360px] w-full overflow-hidden hidden lg:block">
                <Image
                    src={bannerImage}
                    alt="Tất cả sản phẩm"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
            </div>

            <main className="min-h-[80vh] bg-white pb-20 mt-[120px] lg:mt-0">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Breadcrumb */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-6 border-b border-[#f0e8d6] py-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline">Trang chủ</Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#888]">Sản phẩm</span>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00] font-semibold">Tất cả sản phẩm</span>
                    </nav>

                    {/* Tiêu đề */}
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
                        Sản phẩm của chúng tôi
                    </h1>

                    {/* Toolbar */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[14px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="font-['Cormorant_Garamond',_Georgia,_serif] min-w-[150px] cursor-pointer rounded-[2px] border border-[#ddd] bg-white px-3 py-2 text-[13px] text-[#3d2b00] outline-none transition-colors hover:border-[#c4a84f]"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
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
