"use client";

import React from "react";
import { Product } from "@/src/features/products/types/product.type";
import ProductCard from "@/src/features/products/components/ProductCard";

interface ProductRelatedSectionProps {
    relatedProducts: Product[];
}

export default function ProductRelatedSection({
    relatedProducts,
}: ProductRelatedSectionProps) {
    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <div className="mt-20 border-t border-[#f0e8d6] pt-14">
            <h2
                className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]"
                style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}
            >
                CÙNG BỘ SƯU TẬP
            </h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
