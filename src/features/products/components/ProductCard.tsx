"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Product } from "../types/product.type";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
    return n.toLocaleString("vi-VN") + "₫";
}

// ─── Global cache for collections ─────────────────────────────────────────────
let collectionsCache: Map<string, string> | null = null;
let collectionsFetchPromise: Promise<Map<string, string>> | null = null;

async function fetchAndCacheCollections(): Promise<Map<string, string>> {
    // Nếu cache đã có, trả về ngay lập tức
    if (collectionsCache) {
        return collectionsCache;
    }

    // Nếu đang có một request đang chạy, trả về promise của request đó
    if (collectionsFetchPromise) {
        return collectionsFetchPromise;
    }

    // Nếu chưa có cache và cũng chưa có request nào, tạo một request mới
    collectionsFetchPromise = (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections?isActive=true`);
            if (res.ok) {
                const colData = await res.json();
                const list = Array.isArray(colData) ? colData : colData.data || [];
                collectionsCache = new Map(list.map((c: any) => [c._id || c.id, c.name]));
                return collectionsCache;
            }
        } catch (error) {
            console.error("Failed to fetch collections for ProductCard:", error);
            collectionsFetchPromise = null; // Reset promise nếu có lỗi để có thể thử lại
        }
        return new Map(); // Trả về map rỗng nếu lỗi
    })();

    return collectionsFetchPromise;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
export default function ProductCard({ product }: { product: Product }) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [imgError2, setImgError2] = useState(false);
    const [collectionName, setCollectionName] = useState<string | undefined>(() => {
        // Nếu product.collection đã là string (đã được xử lý ở component cha), dùng luôn
        if (typeof product.collection === 'string' && !product.collection.match(/^[0-9a-fA-F]{24}$/)) {
            return product.collection;
        }
        return undefined;
    });

    const firstImage =
        !imgError && product.images?.[0]
            ? product.images[0]
            : `https://placehold.co/400x400/faf7f2/c4a84f?text=${encodeURIComponent(product.name.slice(0, 12))}`;

    const secondImage = !imgError2 && product.images?.[1] ? product.images[1] : null;

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
        </Link>
    );
}