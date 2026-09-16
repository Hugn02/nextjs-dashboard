"use client";

import React from "react";
import Link from "next/link";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { OrderItem } from "../../types";

interface OrderDetailItemsCardProps {
    items: OrderItem[];
    formatPrice?: (n: number) => string;
}

export default function OrderDetailItemsCard({
    items,
    formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫",
}: OrderDetailItemsCardProps) {
    return (
        <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] font-sans">
                    Danh sách sản phẩm ({items.length})
                </h3>
            </div>

            <div className="divide-y divide-gray-100 px-4 sm:px-6">
                {items.map((item, idx) => {
                    const p = item.product || {};
                    const imgUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                    return (
                        <div key={idx} className="py-4 flex gap-3 sm:gap-4 items-start sm:items-center">
                            {/* Image */}
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white border border-[#ede0c4] rounded overflow-hidden flex-shrink-0 mt-0.5 sm:mt-0">
                                <ImageWithFallback
                                    src={imgUrl}
                                    alt={p.productName || "Sản phẩm"}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-bold text-[#2c1a00] hover:text-[#c4a84f] transition-colors font-sans leading-snug">
                                    <Link
                                        href={`/products/${p.slug}`}
                                        className="no-underline text-inherit cursor-pointer line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-all]"
                                        title={p.productName || "Sản phẩm Bát Tràng"}
                                    >
                                        {p.productName || "Sản phẩm Bát Tràng"}
                                    </Link>
                                </h4>
                                {p.sku && (
                                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                                        Mã SP: {p.sku}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-1.5 gap-2">
                                    <p className="text-xs text-gray-400 font-sans">
                                        SL: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                                        <span className="mx-1.5 text-gray-300">·</span>
                                        <span className="text-gray-400">{formatPrice(item.price)}</span>
                                    </p>
                                    <span className="text-sm font-bold text-gray-800 font-sans whitespace-nowrap shrink-0">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
