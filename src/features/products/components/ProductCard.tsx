"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { Product } from "../types/product.type";
import useCart from "../../cart/hooks/useCart";
import useWishlist from "../../wishlist/hooks/useWishlist";
import { cloudinaryLoader } from "@/src/lib/cloudinary";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

// ─── Global cache for collections ─────────────────────────────────────────────
let collectionsCache: Map<string, string> | null = null;
let collectionsFetchPromise: Promise<Map<string, string>> | null = null;
let collectionsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

async function fetchAndCacheCollections(): Promise<Map<string, string>> {
    const now = Date.now();
    // Nếu cache còn hiệu lực (< 5 phút), trả về ngay lập tức
    if (collectionsCache && now - collectionsCacheTime < CACHE_TTL) {
        return collectionsCache;
    }

    // Nếu đang có một request đang chạy, trả về promise của request đó
    if (collectionsFetchPromise) {
        return collectionsFetchPromise;
    }

    // Nếu chưa có cache hoặc đã hết hạn, tạo một request mới
    collectionsFetchPromise = (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections?isActive=true`);
            if (res.ok) {
                const colData = await res.json();
                const list = Array.isArray(colData) ? colData : colData.data || [];
                collectionsCache = new Map(list.map((c: any) => [c._id || c.id, c.name]));
                collectionsCacheTime = Date.now();
                return collectionsCache;
            }
        } catch (error) {
            console.error("Failed to fetch collections for ProductCard:", error);
            collectionsFetchPromise = null;
        }
        return new Map();
    })();

    return collectionsFetchPromise;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
export default function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [adding, setAdding] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showQty, setShowQty] = useState(false);   // sau click: hiện qty controls
    const [qty, setQty] = useState(1);
    const [hovered, setHovered] = useState(false);
    const [collectionName, setCollectionName] = useState<string | undefined>(() => {
        // Nếu product.collection đã là string (đã được xử lý ở component cha), dùng luôn
        if (typeof product.collection === 'string' && !product.collection.match(/^[0-9a-fA-F]{24}$/)) {
            return product.collection;
        }
        return undefined;
    });

    const firstImage = product.images?.[0] || '';
    const secondImage = product.images?.[1] || null;

    useEffect(() => {
        // Chỉ fetch nếu product.collection là một ID và chưa có collectionName
        if (product.collection && typeof product.collection === 'string' && product.collection.match(/^[0-9a-fA-F]{24}$/) && !collectionName) {
            let isMounted = true;
            fetchAndCacheCollections().then(cache => {
                if (isMounted && cache) {
                    const name = cache.get(product.collection as string);
                    if (name) {
                        setCollectionName(name);
                    }
                }
            });
            return () => { isMounted = false; };
        }
    }, [product.collection, collectionName]);

    return (
        <Link href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] no-underline"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Ảnh sản phẩm */}
            <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
                <ImageWithFallback
                    src={firstImage}
                    alt={product.name}
                    fill
                    loader={typeof firstImage === 'string' && firstImage.includes("res.cloudinary.com") ? cloudinaryLoader : undefined}
                    className={`object-cover transition-all duration-300 ease-in-out ${hovered ? "scale-105" : "scale-100"} ${hovered && secondImage ? "opacity-0" : "opacity-100"}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    fallbackSrc={`https://placehold.co/400x400/faf7f2/c4a84f.png?text=${encodeURIComponent(product.name.slice(0, 12))}`}
                />
                {secondImage && (
                    <ImageWithFallback
                        src={secondImage}
                        alt={`${product.name} - ảnh 2`}
                        fill
                        loader={typeof secondImage === 'string' && secondImage.includes("res.cloudinary.com") ? cloudinaryLoader : undefined}
                        className={`object-cover transition-all duration-300 ease-in-out ${hovered ? "scale-105 opacity-100" : "scale-100 opacity-0"}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        priority={false}
                        fallbackSrc={`https://placehold.co/400x400/faf7f2/c4a84f.png?text=${encodeURIComponent(product.name.slice(0, 12))}`}
                    />
                )}

                {/* Nút Wishlist ❤️ — góc trên phải */}
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (wishlistLoading) return;
                        setWishlistLoading(true);
                        try {
                            await toggleWishlist(product.id || product._id);
                        } finally {
                            setWishlistLoading(false);
                        }
                    }}
                    className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                        isWishlisted(product.id || product._id)
                            ? "bg-red-500 border-red-500 shadow-md shadow-red-200"
                            : "bg-white/80 backdrop-blur-sm border-white/60 opacity-0 group-hover:opacity-100"
                    } hover:scale-110 active:scale-95`}
                    title={isWishlisted(product.id || product._id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                    aria-label="Yêu thích"
                >
                    {wishlistLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={isWishlisted(product.id || product._id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth={isWishlisted(product.id || product._id) ? 0 : 1.8}
                            className={`w-4 h-4 transition-colors duration-200 ${
                                isWishlisted(product.id || product._id) ? "text-white" : "text-[#c4a84f]"
                            }`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    )}
                </button>

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
                {collectionName && (
                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-[10px] uppercase tracking-[1.5px] text-[#8b6914]">
                        {collectionName}
                    </p>
                )}

                <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 overflow-hidden text-[13px] font-semibold leading-[1.5] text-[#2c1a00] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] h-[39px]">
                    {product.name}
                </h3>

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

                {/* Rating & Sold count — Cố định chiều cao (h-5) để tất cả các card luôn thẳng hàng bằng nhau */}
                <div className="flex items-center gap-1.5 text-xs text-[#666] mt-1 font-sans h-5">
                    {((product.reviewCount ?? 0) > 0 || (product.soldCount ?? 0) > 0) && (
                        <>
                            {(product.reviewCount ?? 0) > 0 && (
                                <>
                                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                        ★ {Number(product.rating).toFixed(1)}
                                    </span>
                                    {(product.soldCount ?? 0) > 0 && <span className="text-gray-300">|</span>}
                                </>
                            )}
                            {(product.soldCount ?? 0) > 0 && (
                                <span className="text-gray-500">{product.soldCount} đã bán</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Nút hành động */}
            <div className="px-[14px] pb-[14px]">
                {product.isContact || product.inStock === false || (product.stock !== undefined && product.stock !== null && product.stock <= 0) ? (
                    <button
                        className="w-full cursor-not-allowed rounded-[2px] border border-[#d29f13]/40 bg-gray-100 py-2.5 text-[11px] font-bold uppercase text-gray-500 transition-all duration-200"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: 1.5 }}
                        disabled
                    >
                        {product.isContact ? "Liên hệ đặt hàng" : "Hết hàng"}
                    </button>
                ) : !showQty ? (
                    /* ── State 1: Nút "Thêm vào giỏ hàng" với sweep animation ── */
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowQty(true);
                        }}
                        className="group relative w-full cursor-pointer overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-[9px] text-[11px] font-bold uppercase text-white transition-all duration-300"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: 1.5 }}
                    >
                        {/* White sweep — tự điền từ giữa ra */}
                        <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[110%]" />
                        {/* Text giữ nguyên, chỉ đổi màu */}
                        <span className="relative transition-colors duration-300 ease-out group-hover:text-[#d29f13]">
                            Thêm vào giỏ hàng
                        </span>
                    </button>
                ) : (
                    /* ── State 2: Controls số lượng + icon giỏ hàng ── */
                    <div
                        className="flex items-center gap-2"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        {/* Pill: - qty + */}
                        <div className="flex flex-1 items-center justify-between rounded-[30px] border border-[#d29f13] overflow-hidden h-[38px] px-1">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
                                disabled={qty <= 1}
                                className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#d29f13] text-base font-bold hover:bg-[#fef9ec] rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                                -
                            </button>
                            <span className="text-sm font-semibold text-[#2c1a00] select-none" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                {qty}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (product.stock !== undefined && product.stock !== null && qty >= product.stock) {
                                        return;
                                    }
                                    setQty(q => q + 1);
                                }}
                                disabled={product.stock !== undefined && product.stock !== null && qty >= product.stock}
                                className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#d29f13] text-base font-bold hover:bg-[#fef9ec] rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>

                        {/* Icon giỏ hàng — pill-circle với sweep animation */}
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (adding) return;
                                if (product.stock !== undefined && product.stock !== null && qty > product.stock) {
                                    alert(`Số lượng tồn kho chỉ còn ${product.stock} sản phẩm.`);
                                    return;
                                }
                                setAdding(true);
                                try {
                                    const added = await addItem(product.id || product._id, qty);
                                    if (added) {
                                        setQty(1);
                                        setShowQty(false);
                                        // Phát sự kiện — modal sẽ hiện ở app level
                                        window.dispatchEvent(
                                            new CustomEvent("cart-added", {
                                                detail: { productName: product.name },
                                            })
                                        );
                                    }
                                } catch (err: any) {
                                    alert(err.message || "Có lỗi xảy ra");
                                } finally {
                                    setAdding(false);
                                }
                            }}
                            disabled={adding}
                            className="group relative w-[38px] h-[38px] flex-shrink-0 overflow-hidden rounded-full border border-[#d29f13] bg-[#d29f13] cursor-pointer transition-all duration-300 disabled:opacity-50"
                            title="Thêm vào giỏ hàng"
                        >
                            {/* Sweep white */}
                            <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[160%]" />
                            <span className="relative flex items-center justify-center w-full h-full">
                                {adding ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-[#d29f13] group-hover:border-t-transparent" />
                                ) : (
                                    <svg
                                        width="16" height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-white group-hover:text-[#d29f13] transition-colors duration-300"
                                    >
                                        <circle cx="9" cy="21" r="1"/>
                                        <circle cx="20" cy="21" r="1"/>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    </svg>
                                )}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </Link>
    );
}