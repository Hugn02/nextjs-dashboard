"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { formatImageUrl, formatVideoUrl } from "@/src/lib/cloudinary";

interface ProductReviewsSectionProps {
    reviews: any[];
    reviewsLoading: boolean;
    averageRating: number;
    counts: { all: number; 5: number; 4: number; 3: number; 2: number; 1: number };
    ratingFilter: string | number;
    mediaFilter: "all" | "image" | "video";
    paginatedReviews: any[];
    totalPages: number;
    currentPage: number;
    renderStars: (rating: number) => React.ReactNode;
    onFilterChange: (filter: string | number) => void;
    onMediaFilterChange: (filter: "all" | "image" | "video") => void;
    onPageChange: (page: number) => void;
}

export default function ProductReviewsSection({
    reviews,
    reviewsLoading,
    averageRating,
    counts,
    ratingFilter,
    mediaFilter,
    paginatedReviews,
    totalPages,
    currentPage,
    renderStars,
    onFilterChange,
    onMediaFilterChange,
    onPageChange,
}: ProductReviewsSectionProps) {
    const [lightboxMedia, setLightboxMedia] = useState<{ type: "image" | "video"; url: string } | null>(null);

    return (
        <>
            <div className="mt-20 border-t border-[#f0e8d6] pt-14 font-['Cormorant_Garamond',_serif]">
                <h2
                    className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-8 text-center font-light uppercase tracking-[3px] text-[#2c1a00]"
                    style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}
                >
                    ĐÁNH GIÁ SẢN PHẨM
                </h2>

                {reviewsLoading ? (
                    <p className="text-center text-[#888] text-sm">Đang tải đánh giá...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-center text-[#888] text-sm italic py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                    <div className="max-w-3xl mx-auto mb-16">
                        {/* Rating & Filter Summary Box */}
                        <div className="bg-[#fffbf8] p-6 rounded-sm border border-[#f9ede5] flex flex-col md:flex-row gap-6 items-center mb-8">
                            {/* Left: Score */}
                            <div className="text-center md:border-r border-[#f9ede5] md:pr-8 flex flex-col items-center justify-center min-w-[140px]">
                                <p className="text-[15px] text-[#ee4d2d] m-0">
                                    <span className="text-3xl font-bold">{averageRating}</span> trên 5
                                </p>
                                <div className="mt-1">{renderStars(averageRating)}</div>
                            </div>

                            {/* Right: Filter Tags */}
                            <div className="flex-1 flex flex-wrap gap-2 justify-center md:justify-start">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onFilterChange("all");
                                        onMediaFilterChange("all");
                                    }}
                                    className={`px-4 py-1.5 text-[13px] rounded-[2px] border transition-all cursor-pointer ${
                                        ratingFilter === "all" && mediaFilter === "all"
                                            ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                            : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                    }`}
                                >
                                    Tất Cả ({counts.all})
                                </button>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => {
                                            onFilterChange(star);
                                            onMediaFilterChange("all");
                                        }}
                                        className={`px-4 py-1.5 text-[13px] rounded-[2px] border transition-all cursor-pointer ${
                                            ratingFilter === star
                                                ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                                : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                        }`}
                                    >
                                        {star} Sao ({counts[star as 1 | 2 | 3 | 4 | 5]})
                                    </button>
                                ))}
                                {/* Media filters */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onMediaFilterChange(mediaFilter === "image" ? "all" : "image");
                                        onFilterChange("all");
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] rounded-[2px] border transition-all cursor-pointer ${
                                        mediaFilter === "image"
                                            ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                            : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    Có ảnh
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onMediaFilterChange(mediaFilter === "video" ? "all" : "video");
                                        onFilterChange("all");
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] rounded-[2px] border transition-all cursor-pointer ${
                                        mediaFilter === "video"
                                            ? "border-[#ee4d2d] text-[#ee4d2d] bg-white"
                                            : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                    </svg>
                                    Có video
                                </button>
                            </div>
                        </div>

                        {/* Reviews List */}
                        {paginatedReviews.length === 0 ? (
                            <div className="text-center text-[#888] text-sm py-12 border-t border-[#f0e8d6]">
                                Không có đánh giá nào phù hợp với bộ lọc đã chọn.
                            </div>
                        ) : (
                            <div className="space-y-0 divide-y divide-[#f5f5f5]">
                                {paginatedReviews.map((r, index) => (
                                    <div key={r.id || index} className="py-6 flex gap-4">
                                        {/* Left: Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-[#f5f5f5] border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase flex-shrink-0">
                                            {r.user?.fullName ? r.user.fullName.charAt(0) : "K"}
                                        </div>

                                        {/* Right: Content */}
                                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                            <span className="font-bold text-[#333] text-[15px] block truncate">
                                                {r.user?.fullName || "Khách mua hàng"}
                                            </span>
                                            <div>{renderStars(r.rating)}</div>
                                            <span className="text-[15px] text-[#999]">
                                                {new Date(r.createdAt).toLocaleString("vi-VN")}
                                            </span>

                                            {/* Comment */}
                                            <p className="mt-2 text-[15px] text-[#333] leading-relaxed whitespace-pre-line m-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                                {r.comment}
                                            </p>

                                            {/* Review Images */}
                                            {r.images && r.images.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {r.images.map((img: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setLightboxMedia({ type: "image", url: formatImageUrl(img) })}
                                                            className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-[#ede0c4] bg-[#faf7f2] hover:border-[#c4a84f] hover:scale-105 transition shadow-sm cursor-zoom-in relative group"
                                                        >
                                                            <img
                                                                src={formatImageUrl(img)}
                                                                alt={`Ảnh đánh giá ${i + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                                                Xem
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Review Video */}
                                            {r.video && (
                                                <div className="mt-3 max-w-xs">
                                                    <div className="rounded-xl overflow-hidden bg-black border border-[#ede0c4] shadow-sm">
                                                        <video
                                                            src={formatVideoUrl(r.video)}
                                                            controls
                                                            preload="metadata"
                                                            className="w-full max-h-48 object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-[#f0e8d6] text-sm">
                                <button
                                    type="button"
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-[#e8e8e8] rounded-[2px] bg-white text-[#555] disabled:opacity-40 disabled:hover:text-[#555] disabled:hover:border-[#e8e8e8] hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    &lt;
                                </button>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => onPageChange(page)}
                                            className={`px-3 py-1.5 rounded-[2px] border transition-all cursor-pointer ${
                                                currentPage === page
                                                    ? "border-[#ee4d2d] bg-[#ee4d2d] text-white"
                                                    : "border-[#e8e8e8] text-[#555] bg-white hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-[#e8e8e8] rounded-[2px] bg-white text-[#555] disabled:opacity-40 disabled:hover:text-[#555] disabled:hover:border-[#e8e8e8] hover:border-[#ee4d2d] hover:text-[#ee4d2d] transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox Media Modal */}
            {lightboxMedia && (
                <div
                    className="fixed inset-0 bg-black/85 z-[100000] flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxMedia(null)}
                >
                    <div
                        className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-black"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lightboxMedia.type === "image" ? (
                            <img
                                src={lightboxMedia.url}
                                alt="Xem ảnh phóng to"
                                className="w-full h-full object-contain max-h-[85vh]"
                            />
                        ) : (
                            <video
                                src={lightboxMedia.url}
                                controls
                                autoPlay
                                className="w-full max-h-[85vh] object-contain"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setLightboxMedia(null)}
                            className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
