"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/src/features/products/types/product.type";

interface ProductInfoProps {
    product: Product;
    categoryInfo: { name: string; slug: string } | null;
    collectionInfo: { name: string; slug: string } | null;
    totalReviews: number;
    averageRating: number;
    renderStars: (rating: number) => React.ReactNode;
    quantity: number;
    quantityInput: string;
    quantityError: string | null;
    onQuantityChange: (val: string) => void;
    onQuantityBlur: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    onAddToCart: () => void;
    isWishlisted: boolean;
    wishlistLoading: boolean;
    onToggleWishlist: () => void;
    descExpanded: boolean;
    onToggleDesc: () => void;
}

function formatPrice(n: number) {
    return (n || 0).toLocaleString("vi-VN") + "₫";
}

export default function ProductInfo({
    product,
    categoryInfo,
    collectionInfo,
    totalReviews,
    averageRating,
    renderStars,
    quantity,
    quantityInput,
    quantityError,
    onQuantityChange,
    onQuantityBlur,
    onIncrement,
    onDecrement,
    onAddToCart,
    isWishlisted,
    wishlistLoading,
    onToggleWishlist,
    descExpanded,
    onToggleDesc,
}: ProductInfoProps) {
    return (
        <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">
            <div className="min-w-0">
                {/* Brand/Collection Name */}
                {product.brandName && (
                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-1.5 text-xs uppercase tracking-[2px] text-[#c4a84f]">
                        {product.brandName}
                    </p>
                )}

                {/* Product Title */}
                <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 text-xl lg:text-2xl font-semibold leading-snug text-[#2c1a00] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                    {product.name}
                </h1>

                {/* Rating & Sold summary — chỉ hiện khi có dữ liệu thực */}
                {(totalReviews > 0 || (product.soldCount ?? 0) > 0) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {totalReviews > 0 && (
                            <>
                                {renderStars(averageRating)}
                                <span className="text-xs text-[#888] font-['Cormorant_Garamond',_serif]">
                                    {averageRating}/5 ({totalReviews} đánh giá)
                                </span>
                            </>
                        )}
                        {totalReviews > 0 && (product.soldCount ?? 0) > 0 && (
                            <span className="text-[#ccc]">|</span>
                        )}
                        {(product.soldCount ?? 0) > 0 && (
                            <span className="text-xs text-[#666] font-['Cormorant_Garamond',_serif]">
                                Đã bán {product.soldCount}
                            </span>
                        )}
                    </div>
                )}

                {/* SKU Code */}
                {product.sku && (
                    <p className="m-0 mt-2 text-[12px] text-[#888] font-mono tracking-wider uppercase">
                        Mã SP: {product.sku}
                    </p>
                )}

                {/* Category & Collection Info */}
                <div className="mt-3 flex flex-col gap-1">
                    {categoryInfo && (
                        <p className="m-0 text-[12px] text-[#888] font-['Cormorant_Garamond',_serif]">
                            <span className="font-semibold text-[#3d2b00]">Loại sản phẩm:</span>{" "}
                            <Link href={`/categories/${categoryInfo.slug}`} className="text-[#c4a84f] no-underline hover:underline">
                                {categoryInfo.name}
                            </Link>
                        </p>
                    )}
                    {collectionInfo && (
                        <p className="m-0 text-[12px] text-[#888] font-['Cormorant_Garamond',_serif]">
                            <span className="font-semibold text-[#3d2b00]">Bộ sưu tập:</span>{" "}
                            <Link href={`/collections/${collectionInfo.slug}`} className="text-[#c4a84f] no-underline hover:underline">
                                {collectionInfo.name}
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-wrap items-baseline gap-3 border-b border-[#f0e8d6] pb-4">
                {product.isContact ? (
                    <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-bold text-[#8b6914]">
                        Liên hệ đặt hàng
                    </span>
                ) : (
                    <>
                        <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl lg:text-3xl font-bold text-[#8b2500]">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-sm text-[#aaa] line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Availability status */}
            <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-[#888] tracking-widest font-['Cormorant_Garamond',_serif]">Tình trạng:</span>
                <span className={`text-[13px] font-semibold ${product.inStock ? "text-[#c4a84f]" : "text-red-500"}`}>
                    {product.inStock
                        ? `Còn hàng${product.stock !== undefined && product.stock !== null ? ` (${product.stock} sản phẩm có sẵn)` : ""}`
                        : "Hết hàng"}
                </span>
            </div>

            {/* Weight info */}
            {product.weightGrams !== undefined && (
                <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-[#888] tracking-widest font-['Cormorant_Garamond',_serif]">Khối lượng:</span>
                    <span className="text-[13px] font-semibold text-[#3d2b00]">
                        {product.weightGrams >= 1000
                            ? `${(product.weightGrams / 1000).toFixed(product.weightGrams % 1000 === 0 ? 0 : 1)} kg`
                            : `${product.weightGrams} g`}
                    </span>
                </div>
            )}

            {/* Quantity and Cart Button */}
            {!product.isContact && product.inStock && (
                <div className={`relative mt-2 ${quantityError ? "pb-5" : ""}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                        {/* Quantity selector */}
                        <div className={`flex items-center justify-between border rounded-[2px] bg-white h-[46px] w-full sm:w-[130px] px-2 ${quantityError ? "border-red-500" : "border-[#ede0c4]"}`}>
                            <button
                                type="button"
                                onClick={onDecrement}
                                disabled={(parseInt(quantityInput, 10) || quantity) <= 1}
                                className="bg-transparent border-none text-[#3d2b00] text-lg font-light cursor-pointer select-none px-2 h-full flex items-center justify-center hover:text-[#c4a84f] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[#3d2b00]"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={product.stock || 9999}
                                value={quantityInput}
                                onChange={(e) => onQuantityChange(e.target.value)}
                                onBlur={onQuantityBlur}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onQuantityBlur();
                                    }
                                }}
                                className="w-12 text-center font-['Cormorant_Garamond',_serif] text-base font-semibold text-[#3d2b00] border-none outline-none focus:bg-[#faf7f2] rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                type="button"
                                onClick={onIncrement}
                                className="bg-transparent border-none text-[#3d2b00] text-lg font-light cursor-pointer select-none px-2 h-full flex items-center justify-center hover:text-[#c4a84f]"
                            >
                                +
                            </button>
                        </div>

                        {/* Action button */}
                        <button
                            type="button"
                            onClick={onAddToCart}
                            className="group relative flex-1 cursor-pointer overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-[15px] px-[25px] text-[13px] font-semibold uppercase tracking-[1px] transition-colors duration-300 ease-out"
                        >
                            <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[105%]"></span>
                            <span className="relative text-white transition-colors duration-300 ease-out group-hover:text-[#d29f13]">Thêm vào giỏ hàng</span>
                        </button>

                        {/* Wishlist ❤️ button */}
                        <button
                            type="button"
                            onClick={onToggleWishlist}
                            className={`flex items-center justify-center w-[46px] h-[46px] flex-shrink-0 rounded-[30px] border transition-all duration-300 ${
                                isWishlisted
                                    ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-200"
                                    : "bg-white border-[#d29f13] text-[#d29f13] hover:bg-red-50 hover:border-red-400 hover:text-red-500"
                            } hover:scale-105 active:scale-95 cursor-pointer`}
                            title={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                            aria-label="Yêu thích"
                        >
                            {wishlistLoading ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={isWishlisted ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth={isWishlisted ? 0 : 1.8}
                                    className="w-5 h-5 transition-transform duration-200"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {quantityError && (
                        <p className="absolute left-0 bottom-0 m-0 text-red-600 text-[11px] font-['Cormorant_Garamond',_serif] w-full sm:w-auto">
                            {quantityError}
                        </p>
                    )}
                </div>
            )}

            {/* Contact Purchase option */}
            {(product.isContact || !product.inStock) && (
                <button
                    type="button"
                    className="w-full cursor-pointer rounded-[2px] border border-[#c4a84f] bg-white py-3.5 text-[12px] font-bold uppercase tracking-[2px] text-[#8b6914] transition-all duration-200 hover:bg-[#c4a84f] hover:text-white font-['Cormorant_Garamond',_serif]"
                >
                    Liên hệ đặt hàng
                </button>
            )}

            {/* Basic description */}
            {product.description && (
                <div className="border-t border-[#f0e8d6] pt-6 flex flex-col gap-3">
                    <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-[#3d2b00] font-['Cormorant_Garamond',_serif]">
                        Thông tin cơ bản
                    </h3>
                    <div className="font-['Cormorant_Garamond',_serif] text-[#555] text-sm leading-relaxed flex flex-col gap-2.5">
                        <div className="relative">
                            <p className={`m-0 text-justify ${!descExpanded ? "line-clamp-4" : ""}`}>
                                {product.description}
                            </p>
                            {product.description.length > 200 && (
                                <button
                                    type="button"
                                    onClick={onToggleDesc}
                                    className="mt-1 bg-none border-none text-[#c4a84f] font-semibold text-xs cursor-pointer hover:underline p-0"
                                >
                                    {descExpanded ? "Thu gọn..." : "Xem thêm..."}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Specifications dynamic table */}
            {product.specifications && product.specifications.length > 0 && (
                <div className="border-t border-[#f0e8d6] pt-6 flex flex-col gap-3">
                    <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-[#3d2b00] font-['Cormorant_Garamond',_serif]">
                        Thông tin chi tiết
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse mt-2 text-sm font-['Cormorant_Garamond',_serif]">
                            <tbody className="divide-y divide-[#f0e8d6]">
                                {product.specifications.map((spec, index) => (
                                    <tr key={index}>
                                        <td className="py-2.5 pr-4 font-semibold text-[#3d2b00]">{spec.label}</td>
                                        <td className="py-2.5 text-[#555]">{spec.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
