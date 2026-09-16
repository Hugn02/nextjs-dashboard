import React from "react";

export default function ProductDetailSkeleton() {
    return (
        <div className="mx-auto max-w-[1280px] px-6 pt-[140px] pb-20">
            {/* Breadcrumb skeleton */}
            <div className="mb-8 border-b border-[#f0e8d6] py-4 flex gap-3">
                <div className="h-3 w-16 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-3 w-3 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-3 w-24 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-3 w-3 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-3 w-40 rounded bg-[#f0e8d6] animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                {/* Left: Image gallery skeleton */}
                <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
                    {/* Thumbnails */}
                    <div className="order-2 md:order-1 flex md:flex-col gap-3 min-w-[80px]">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-16 md:w-20 aspect-square bg-[#f0e8d6] animate-pulse rounded-[2px]" />
                        ))}
                    </div>
                    {/* Main image */}
                    <div className="order-1 md:order-2 flex-1 aspect-[4/5] md:aspect-square bg-[#f0e8d6] animate-pulse rounded-[2px]" />
                </div>

                {/* Right: Info skeleton */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                    {/* Brand + Title */}
                    <div className="flex flex-col gap-3">
                        <div className="h-3 w-28 rounded bg-[#f0e8d6] animate-pulse" />
                        <div className="h-7 w-3/4 rounded bg-[#f0e8d6] animate-pulse" />
                        <div className="h-7 w-1/2 rounded bg-[#f0e8d6] animate-pulse" />
                    </div>
                    {/* Rating */}
                    <div className="h-4 w-36 rounded bg-[#f0e8d6] animate-pulse" />
                    {/* Price */}
                    <div className="border-b border-[#f0e8d6] pb-4">
                        <div className="h-9 w-48 rounded bg-[#f0e8d6] animate-pulse" />
                    </div>
                    {/* Stock status */}
                    <div className="h-4 w-24 rounded bg-[#f0e8d6] animate-pulse" />
                    {/* Add to cart button */}
                    <div className="h-[46px] w-full rounded-[30px] bg-[#f0e8d6] animate-pulse mt-2" />
                    {/* Description lines */}
                    <div className="border-t border-[#f0e8d6] pt-5 flex flex-col gap-2">
                        <div className="h-3 w-full rounded bg-[#f0e8d6] animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-[#f0e8d6] animate-pulse" />
                        <div className="h-3 w-4/5 rounded bg-[#f0e8d6] animate-pulse" />
                        <div className="h-3 w-3/4 rounded bg-[#f0e8d6] animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
