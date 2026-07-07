import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CategoryOption, CollectionOption } from "../hooks/useProductFilterOptions";

const PRICE_PRESETS = [
    { label: "Dưới 500.000đ", min: 0, max: 500000 },
    { label: "500.000đ – 1.000.000đ", min: 500000, max: 1000000 },
    { label: "1.000.000đ – 2.000.000đ", min: 1000000, max: 2000000 },
    { label: "Trên 2.000.000đ", min: 2000000, max: undefined },
];

interface ProductFilterProps {
    categories: CategoryOption[];
    collections: CollectionOption[];

    selectedCategory?: string | null;
    setSelectedCategory?: (val: string | null) => void;

    selectedCollection?: string | null;
    setSelectedCollection?: (val: string | null) => void;

    priceRange: { min?: number; max?: number } | null;
    setPriceRange: (val: { min?: number; max?: number } | null) => void;

    currentCategorySlug?: string;
    currentCollectionSlug?: string;

    showUnimplementedSections?: boolean;
}

export default function ProductFilter({
    categories,
    collections,
    selectedCategory,
    setSelectedCategory,
    selectedCollection,
    setSelectedCollection,
    priceRange,
    setPriceRange,
    currentCategorySlug,
    currentCollectionSlug,
    showUnimplementedSections = false,
}: ProductFilterProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const [customMin, setCustomMin] = useState<string>("");
    const [customMax, setCustomMax] = useState<string>("");
    const [expandedSection, setExpandedSection] = useState<string | null>(
        setSelectedCategory ? "category" : "collection"
    );

    const filterRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        };
        if (filterOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterOpen]);

    // Clear custom price inputs if priceRange is cleared
    useEffect(() => {
        if (priceRange === null) {
            setCustomMin("");
            setCustomMax("");
        }
    }, [priceRange]);

    const toggleSection = (section: string) => {
        setExpandedSection((prev) => (prev === section ? null : section));
    };

    const applyCustomPrice = () => {
        const min = customMin ? parseInt(customMin, 10) : undefined;
        const max = customMax ? parseInt(customMax, 10) : undefined;
        if (min !== undefined || max !== undefined) {
            setPriceRange({ min, max });
        }
    };

    const hasActiveFilters =
        (selectedCategory !== undefined && selectedCategory !== null) ||
        (selectedCollection !== undefined && selectedCollection !== null) ||
        priceRange !== null;

    const activeFilterCount =
        (selectedCategory ? 1 : 0) + (selectedCollection ? 1 : 0) + (priceRange ? 1 : 0);

    return (
        <div className="relative flex items-center gap-4" ref={filterRef}>
            {/* Filter Button */}
            <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`font-['Cormorant_Garamond',_Georgia,_serif] flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-4 py-2 text-[13px] text-[#3d2b00] transition-all ${
                    filterOpen || hasActiveFilters
                        ? "border-[#c4a84f] bg-[#c4a84f]/5"
                        : "border-[#ddd] bg-transparent hover:border-[#c4a84f]"
                }`}
            >
                <span>Bộ lọc</span>
                {hasActiveFilters && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c4a84f] text-[9px] text-white font-bold">
                        {activeFilterCount}
                    </span>
                )}
                <span
                    className={`text-[10px] transition-transform duration-200 ${
                        filterOpen ? "rotate-180" : ""
                    }`}
                >
                    ▾
                </span>
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
                <div className="absolute right-0 sm:left-0 top-full z-[999] mt-2 w-[290px] border border-[#ede0c4] bg-white shadow-[0_12px_40px_rgba(196,168,79,0.15)] rounded-[3px]">
                    <div className="max-h-[70vh] overflow-y-auto">
                        
                        {/* ── CATEGORY SECTION ── */}
                        <div className="border-b border-[#f0e8d6]">
                            <button
                                onClick={() => toggleSection("category")}
                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    Loại sản phẩm
                                    {((selectedCategory !== undefined && selectedCategory !== null) || currentCategorySlug) && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />
                                    )}
                                </span>
                                <span
                                    className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${
                                        expandedSection === "category" ? "rotate-45" : ""
                                    }`}
                                >
                                    +
                                </span>
                            </button>
                            {expandedSection === "category" && (
                                <div className="filter-accordion-content px-4 pb-3 flex flex-col gap-1.5">
                                    {setSelectedCategory ? (
                                        // In-place radio filters
                                        <>
                                            <label className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                <input
                                                    type="radio"
                                                    name="filter-category"
                                                    checked={selectedCategory === null}
                                                    onChange={() => setSelectedCategory(null)}
                                                    className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span
                                                    className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                        selectedCategory === null
                                                            ? "font-semibold text-[#c4a84f]"
                                                            : "text-[#3d2b00]"
                                                    }`}
                                                >
                                                    Tất cả loại sản phẩm
                                                </span>
                                            </label>
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat._id || cat.id || cat.slug}
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="filter-category"
                                                        checked={selectedCategory === cat.slug}
                                                        onChange={() => setSelectedCategory(cat.slug)}
                                                        className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                    <span
                                                        className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                            selectedCategory === cat.slug
                                                                ? "font-semibold text-[#c4a84f]"
                                                                : "text-[#3d2b00]"
                                                        }`}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </>
                                    ) : (
                                        // Link navigation
                                        <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
                                            {categories.length === 0 ? (
                                                <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#bbb] py-1 px-1 italic">
                                                    Đang tải...
                                                </p>
                                            ) : (
                                                categories.map((cat) => (
                                                    <Link
                                                        key={cat._id || cat.id || cat.slug}
                                                        href={`/categories/${cat.slug}`}
                                                        onClick={() => setFilterOpen(false)}
                                                        className={`block rounded-[2px] px-2 py-1.5 font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] no-underline transition-all hover:bg-[#faf7f2] hover:translate-x-0.5 ${
                                                            cat.slug === currentCategorySlug
                                                                ? "font-semibold text-[#c4a84f] bg-[#faf7f2]"
                                                                : "text-[#3d2b00]"
                                                        }`}
                                                    >
                                                        {cat.slug === currentCategorySlug ? "✓ " : "○ "}
                                                        {cat.name}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── COLLECTION SECTION ── */}
                        <div className="border-b border-[#f0e8d6]">
                            <button
                                onClick={() => toggleSection("collection")}
                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    Bộ sưu tập
                                    {((selectedCollection !== undefined && selectedCollection !== null) || currentCollectionSlug) && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />
                                    )}
                                </span>
                                <span
                                    className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${
                                        expandedSection === "collection" ? "rotate-45" : ""
                                    }`}
                                >
                                    +
                                </span>
                            </button>
                            {expandedSection === "collection" && (
                                <div className="filter-accordion-content px-4 pb-3 flex flex-col gap-1.5">
                                    {setSelectedCollection ? (
                                        // In-place radio filters
                                        <>
                                            <label className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                                <input
                                                    type="radio"
                                                    name="filter-collection"
                                                    checked={selectedCollection === null}
                                                    onChange={() => setSelectedCollection(null)}
                                                    className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span
                                                    className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                        selectedCollection === null
                                                            ? "font-semibold text-[#c4a84f]"
                                                            : "text-[#3d2b00]"
                                                    }`}
                                                >
                                                    Tất cả bộ sưu tập
                                                </span>
                                            </label>
                                            {collections.map((col) => (
                                                <label
                                                    key={col._id || col.id || col.slug}
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="filter-collection"
                                                        checked={selectedCollection === col.slug}
                                                        onChange={() => setSelectedCollection(col.slug)}
                                                        className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                    <span
                                                        className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                            selectedCollection === col.slug
                                                                ? "font-semibold text-[#c4a84f]"
                                                                : "text-[#3d2b00]"
                                                        }`}
                                                    >
                                                        {col.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </>
                                    ) : (
                                        // Link navigation
                                        <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
                                            {collections.length === 0 ? (
                                                <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#bbb] py-1 px-1 italic">
                                                    Đang tải...
                                                </p>
                                            ) : (
                                                collections.map((col) => (
                                                    <Link
                                                        key={col._id || col.id || col.slug}
                                                        href={`/collections/${col.slug}`}
                                                        onClick={() => setFilterOpen(false)}
                                                        className={`block rounded-[2px] px-2 py-1.5 font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] no-underline transition-all hover:bg-[#faf7f2] hover:translate-x-0.5 ${
                                                            col.slug === currentCollectionSlug
                                                                ? "font-semibold text-[#c4a84f] bg-[#faf7f2]"
                                                                : "text-[#3d2b00]"
                                                        }`}
                                                    >
                                                        {col.slug === currentCollectionSlug ? "✓ " : "○ "}
                                                        {col.name}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── PRICE RANGE SECTION ── */}
                        <div className="border-b border-[#f0e8d6]">
                            <button
                                onClick={() => toggleSection("price")}
                                className="flex w-full items-center justify-between px-4 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] font-semibold uppercase tracking-[1.5px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    Khoảng giá
                                    {priceRange && <span className="h-1.5 w-1.5 rounded-full bg-[#c4a84f]" />}
                                </span>
                                <span
                                    className={`text-[16px] text-[#c4a84f] transition-transform duration-200 ${
                                        expandedSection === "price" ? "rotate-45" : ""
                                    }`}
                                >
                                    +
                                </span>
                            </button>
                            {expandedSection === "price" && (
                                <div className="filter-accordion-content px-4 pb-4 flex flex-col gap-1.5">
                                    {/* Preset options */}
                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors">
                                        <input
                                            type="radio"
                                            name="filter-price"
                                            checked={priceRange === null}
                                            onChange={() => setPriceRange(null)}
                                            className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                        />
                                        <span
                                            className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                priceRange === null ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"
                                            }`}
                                        >
                                            Tất cả mức giá
                                        </span>
                                    </label>
                                    {PRICE_PRESETS.map((preset, i) => {
                                        const isActive =
                                            priceRange?.min === preset.min && priceRange?.max === preset.max;
                                        return (
                                            <label
                                                key={i}
                                                className="flex cursor-pointer items-center gap-2.5 rounded-[2px] px-1 py-1.5 hover:bg-[#faf7f2] transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="filter-price"
                                                    checked={isActive}
                                                    onChange={() => setPriceRange({ min: preset.min, max: preset.max })}
                                                    className="accent-[#c4a84f] w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span
                                                    className={`font-['Cormorant_Garamond',_Georgia,_serif] text-[13px] ${
                                                        isActive ? "font-semibold text-[#c4a84f]" : "text-[#3d2b00]"
                                                    }`}
                                                >
                                                    {preset.label}
                                                </span>
                                            </label>
                                        );
                                    })}

                                    {/* Custom Price Range Input */}
                                    <div className="mt-2.5 border-t border-[#f0e8d6] pt-3">
                                        <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[10px] uppercase tracking-[1.5px] text-[#888] mb-2">
                                            Tự chọn khoảng giá (đ)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Từ"
                                                value={customMin}
                                                onChange={(e) => setCustomMin(e.target.value)}
                                                className="w-full rounded-[2px] border border-[#ddd] px-2 py-1.5 text-xs outline-none transition-colors focus:border-[#c4a84f] font-['Cormorant_Garamond',_Georgia,_serif]"
                                            />
                                            <span className="text-[#bbb] text-[10px]">—</span>
                                            <input
                                                type="number"
                                                placeholder="Đến"
                                                value={customMax}
                                                onChange={(e) => setCustomMax(e.target.value)}
                                                className="w-full rounded-[2px] border border-[#ddd] px-2 py-1.5 text-xs outline-none transition-colors focus:border-[#c4a84f] font-['Cormorant_Garamond',_Georgia,_serif]"
                                            />
                                        </div>
                                        <button
                                            onClick={applyCustomPrice}
                                            className="mt-2 w-full rounded-[2px] border border-[#c4a84f] bg-transparent py-1.5 font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] uppercase tracking-[1.5px] text-[#8b6914] cursor-pointer transition-all hover:bg-[#c4a84f] hover:text-white"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── UNIMPLEMENTED SECTIONS ── */}
                        {showUnimplementedSections &&
                            ["Phong cách thiết kế", "Chất liệu", "Sản phẩm lẻ/Bộ", "Mục đích sử dụng"].map((title) => (
                                <div key={title} className="border-b border-[#f0e8d6] last:border-b-0">
                                    <div className="flex items-center justify-between px-4 py-3 opacity-40 cursor-not-allowed">
                                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] uppercase tracking-[1.5px] text-[#2c1a00]">
                                            {title}
                                        </span>
                                        <span className="text-[16px] text-[#c4a84f]">+</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface ActiveFiltersProps {
    categories: CategoryOption[];
    collections: CollectionOption[];

    selectedCategory?: string | null;
    setSelectedCategory?: (val: string | null) => void;

    selectedCollection?: string | null;
    setSelectedCollection?: (val: string | null) => void;

    priceRange: { min?: number; max?: number } | null;
    setPriceRange: (val: { min?: number; max?: number } | null) => void;

    clearAllFilters: () => void;
}

export function ActiveFilters({
    categories,
    collections,
    selectedCategory,
    setSelectedCategory,
    selectedCollection,
    setSelectedCollection,
    priceRange,
    setPriceRange,
    clearAllFilters,
}: ActiveFiltersProps) {
    const hasActiveFilters =
        (selectedCategory !== undefined && selectedCategory !== null) ||
        (selectedCollection !== undefined && selectedCollection !== null) ||
        priceRange !== null;

    if (!hasActiveFilters) return null;

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] uppercase tracking-wider text-[#888]">
                Đang lọc:
            </span>

            {selectedCategory && setSelectedCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                    {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none"
                    >
                        ×
                    </button>
                </span>
            )}

            {selectedCollection && setSelectedCollection && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                    {collections.find((c) => c.slug === selectedCollection)?.name || selectedCollection}
                    <button
                        onClick={() => setSelectedCollection(null)}
                        className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none"
                    >
                        ×
                    </button>
                </span>
            )}

            {priceRange && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4a84f]/40 bg-[#c4a84f]/8 px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] text-[#8b6914]">
                    {priceRange.min !== undefined && priceRange.max !== undefined
                        ? `${priceRange.min.toLocaleString("vi-VN")}đ – ${priceRange.max.toLocaleString("vi-VN")}đ`
                        : priceRange.max !== undefined
                        ? `Dưới ${priceRange.max.toLocaleString("vi-VN")}đ`
                        : `Trên ${priceRange.min?.toLocaleString("vi-VN")}đ`}
                    <button
                        onClick={() => setPriceRange(null)}
                        className="text-[#c4a84f] hover:text-[#8b6914] cursor-pointer bg-transparent border-none text-[14px] leading-none"
                    >
                        ×
                    </button>
                </span>
            )}

            <button
                onClick={clearAllFilters}
                className="font-['Cormorant_Garamond',_Georgia,_serif] text-[11px] text-[#aaa] underline hover:text-[#c4a84f] cursor-pointer bg-transparent border-none transition-colors"
            >
                Xóa tất cả
            </button>
        </div>
    );
}
