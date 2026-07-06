"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { fetchProducts } from '../services/product.service';
import { Product } from "../types/product.type";
import ProductCard from "../components/ProductCard";
import Image from "next/image";

interface ProductFunction {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
}

interface CategoryOption {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    isActive?: boolean;
}

interface CollectionOption {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
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

const PRICE_PRESETS = [
    { label: "Dưới 500.000đ", min: 0, max: 500000 },
    { label: "500.000đ – 1.000.000đ", min: 500000, max: 1000000 },
    { label: "1.000.000đ – 2.000.000đ", min: 1000000, max: 2000000 },
    { label: "Trên 2.000.000đ", min: 2000000, max: undefined },
];

export default function FunctionPage({ slug }: FunctionPageProps) {
    const [func, setFunc] = useState<ProductFunction | null>(null);
    const [funcInactive, setFuncInactive] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("productName-asc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [collections, setCollections] = useState<CollectionOption[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | null>(null);
    const [customMin, setCustomMin] = useState<string>("");
    const [customMax, setCustomMax] = useState<string>("");
    const [expandedSection, setExpandedSection] = useState<string | null>("category");

    const filterRef = useRef<HTMLDivElement>(null);

    // Close filter when click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        };
        if (filterOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterOpen]);

    // Fetch filter options
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [colRes, catRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/collections?isActive=true`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/categories?isActive=true`),
                ]);

                if (colRes.ok) {
                    const colData = await colRes.json();
                    const list: CollectionOption[] = Array.isArray(colData) ? colData : colData.data || [];
                    setCollections(list.filter((c) => c.isActive !== false));
                }
                if (catRes.ok) {
                    const catData = await catRes.json();
                    const list: CategoryOption[] = Array.isArray(catData) ? catData : catData.data || [];
                    setCategories(list.filter((c) => c.isActive !== false));
                }
            } catch (err) {
                console.error("Lỗi fetch options bộ lọc:", err);
            }
        };
        loadFilterOptions();
    }, []);

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
                    limit: 20,
                    status: 'active',
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
    }, [slug, sortBy, selectedCollection, selectedCategory, priceRange]);

    const functionName = func?.name || (slug || "").replace(/-/g, " ").toUpperCase();
    const bannerImage = "/assets/category2.png";

    const hasActiveFilters = selectedCollection !== null || selectedCategory !== null || priceRange !== null;

    const applyCustomPrice = () => {
        const min = customMin ? parseInt(customMin) : undefined;
        const max = customMax ? parseInt(customMax) : undefined;
        if (min !== undefined || max !== undefined) {
            setPriceRange({ min, max });
        }
    };

    const clearAllFilters = () => {
        setSelectedCollection(null);
        setSelectedCategory(null);
        setPriceRange(null);
        setCustomMin("");
        setCustomMax("");
    };

    const toggleSection = (section: string) =>
        setExpandedSection((prev) => (prev === section ? null : section));

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
                    {hasActiveFilters && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] uppercase tracking-wider text-[#888]">Đang lọc:</span>
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                    <button onClick={() => setSelectedCategory(null)} className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none">×</button>
                                </span>
                            )}
                            {selectedCollection && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                                    {collections.find(c => c.slug === selectedCollection)?.name || selectedCollection}
                                    <button onClick={() => setSelectedCollection(null)} className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none">×</button>
                                </span>
                            )}
                            {priceRange && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                                    {priceRange.min !== undefined && priceRange.max !== undefined
                                        ? `${priceRange.min.toLocaleString('vi-VN')}đ – ${priceRange.max.toLocaleString('vi-VN')}đ`
                                        : priceRange.max !== undefined
                                            ? `Dưới ${priceRange.max.toLocaleString('vi-VN')}đ`
                                            : `Trên ${priceRange.min?.toLocaleString('vi-VN')}đ`}
                                    <button onClick={() => { setPriceRange(null); setCustomMin(""); setCustomMax(""); }} className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none">×</button>
                                </span>
                            )}
                            <button onClick={clearAllFilters} className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] text-[#aaa] underline hover:text-[#c4a84f] cursor-pointer bg-transparent border-none transition-colors">
                                Xóa tất cả
                            </button>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8d6] pb-4">
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] text-[#888]">
                            {loading ? "Đang tải..." : `${totalCount} sản phẩm`}
                        </span>

                        <div className="relative flex items-center gap-4" ref={filterRef}>
                            {/* Nút bộ lọc */}
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className={`font-['Cormorant_Garamond',_Georgia,_serif] flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-4 py-2 text-[13px] text-[#3d2b00] transition-all ${filterOpen || hasActiveFilters ? 'border-[#c4a84f] bg-[#c4a84f]/5' : 'border-[#ddd] bg-transparent hover:border-[#c4a84f]'}`}
                            >
                                <span>Bộ lọc</span>
                                {hasActiveFilters && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c4a84f] text-[9px] text-white font-bold">
                                        {(selectedCollection ? 1 : 0) + (selectedCategory ? 1 : 0) + (priceRange ? 1 : 0)}
                                    </span>
                                )}
                                <span className={`text-[10px] transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}>▾</span>
                            </button>

                            {/* Dropdown bộ lọc */}
                            {filterOpen && (
                                <div className="absolute right-0 sm:left-0 top-full z-[999] mt-2 w-[290px] border border-[#ede0c4] bg-white shadow-[0_12px_40px_rgba(196,168,79,0.15)] rounded-[3px]">
                                    <div className="max-h-[70vh] overflow-y-auto">

                                        {/* ── LOẠI SẢN PHẨM (lọc in-place) ── */}
                                        <div className="border-b border-[#f0e8d6]">
                                            <button
                                                onClick={() => toggleSection("category")}
                                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    Loại sản phẩm
                                                    {selectedCategory && <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />}
                                                </span>
                                                <span className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${expandedSection === "category" ? "rotate-45" : ""}`}>+</span>
                                            </button>
                                            {expandedSection === "category" && (
                                                <div className="filter-accordion-content px-4 pb-3 flex flex-col gap-1.5">
                                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="filter-category"
                                                            checked={selectedCategory === null}
                                                            onChange={() => setSelectedCategory(null)}
                                                            className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                        <span className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${selectedCategory === null ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"}`}>
                                                            Tất cả loại sản phẩm
                                                        </span>
                                                    </label>
                                                    {categories.map((cat) => (
                                                        <label key={cat._id || cat.id} className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="filter-category"
                                                                checked={selectedCategory === cat.slug}
                                                                onChange={() => setSelectedCategory(cat.slug)}
                                                                className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                            />
                                                            <span className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${selectedCategory === cat.slug ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"}`}>
                                                                {cat.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ── BỘ SƯU TẬP (lọc in-place) ── */}
                                        <div className="border-b border-[#f0e8d6]">
                                            <button
                                                onClick={() => toggleSection("collection")}
                                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    Bộ sưu tập
                                                    {selectedCollection && <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />}
                                                </span>
                                                <span className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${expandedSection === "collection" ? "rotate-45" : ""}`}>+</span>
                                            </button>
                                            {expandedSection === "collection" && (
                                                <div className="filter-accordion-content px-4 pb-3 flex flex-col gap-1.5">
                                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="filter-collection"
                                                            checked={selectedCollection === null}
                                                            onChange={() => setSelectedCollection(null)}
                                                            className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                        <span className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${selectedCollection === null ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"}`}>
                                                            Tất cả bộ sưu tập
                                                        </span>
                                                    </label>
                                                    {collections.map((col) => (
                                                        <label key={col._id || col.id} className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="filter-collection"
                                                                checked={selectedCollection === col.slug}
                                                                onChange={() => setSelectedCollection(col.slug)}
                                                                className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                            />
                                                            <span className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${selectedCollection === col.slug ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"}`}>
                                                                {col.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ── KHOẢNG GIÁ ── */}
                                        <div className="border-b border-[#f0e8d6]">
                                            <button
                                                onClick={() => toggleSection("price")}
                                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    Khoảng giá
                                                    {priceRange && <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />}
                                                </span>
                                                <span className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${expandedSection === "price" ? "rotate-45" : ""}`}>+</span>
                                            </button>
                                            {expandedSection === "price" && (
                                                <div className="filter-accordion-content px-4 pb-4">
                                                    <div className="flex flex-col gap-1.5 mb-3">
                                                        {PRICE_PRESETS.map((preset, idx) => {
                                                            const isChecked = priceRange?.min === preset.min && priceRange?.max === preset.max;
                                                            return (
                                                                <label key={idx} className="flex cursor-pointer items-center gap-2.5 rounded-[2px] py-1 px-1 hover:bg-[#faf7f2] transition-colors">
                                                                    <input
                                                                        type="radio"
                                                                        name="price-preset"
                                                                        checked={isChecked}
                                                                        onChange={() => setPriceRange({ min: preset.min, max: preset.max })}
                                                                        className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                                    />
                                                                    <span className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${isChecked ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"}`}>
                                                                        {preset.label}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Nhập giá tự chọn */}
                                                    <div className="border-t border-[#f0e8d6] pt-3">
                                                        <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] uppercase tracking-wider text-[#888] mb-2">Giá tự chọn (VNĐ)</p>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Từ"
                                                                value={customMin}
                                                                onChange={(e) => setCustomMin(e.target.value)}
                                                                className="w-full rounded-[2px] border border-[#ddd] px-2 py-1 text-[12px] outline-none focus:border-[#c4a84f] text-[#3d2b00] font-['Cormorant_Garamond',_Georgia,_serif]"
                                                            />
                                                            <span className="text-[12px] text-[#aaa]">—</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Đến"
                                                                value={customMax}
                                                                onChange={(e) => setCustomMax(e.target.value)}
                                                                className="w-full rounded-[2px] border border-[#ddd] px-2 py-1 text-[12px] outline-none focus:border-[#c4a84f] text-[#3d2b00] font-['Cormorant_Garamond',_Georgia,_serif]"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={applyCustomPrice}
                                                            className="w-full cursor-pointer rounded-[2px] bg-[#2c1a00] text-white py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors hover:bg-[#c4a84f]"
                                                        >
                                                            Áp dụng
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}

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
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                </div>
            </main>
        </>
    );
}
