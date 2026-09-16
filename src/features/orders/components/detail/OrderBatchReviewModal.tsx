"use client";

import React, { useState, useEffect } from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { fetchWithAuth } from "@/src/lib/api-client";
import { formatImageUrl, formatVideoUrl } from "@/src/lib/cloudinary";
import {
    Camera,
    Image as ImageIcon,
    Video,
    X,
    Loader2,
} from "lucide-react";
import { OrderDetail } from "../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const STAR_LABELS: Record<number, string> = {
    5: "Cực kỳ hài lòng",
    4: "Hài lòng",
    3: "Bình thường",
    2: "Không hài lòng",
    1: "Rất không hài lòng",
};

interface OrderBatchReviewModalProps {
    order: OrderDetail;
    myReviews: any[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
}

export default function OrderBatchReviewModal({
    order,
    myReviews,
    isOpen,
    onClose,
    onSuccess,
}: OrderBatchReviewModalProps) {
    const [batchReviews, setBatchReviews] = useState<
        Record<
            string,
            {
                rating: number;
                comment: string;
                selected?: boolean;
                images?: string[];
                video?: string | null;
                uploadingImages?: boolean;
                uploadingVideo?: boolean;
            }
        >
    >({});
    const [submittingBatch, setSubmittingBatch] = useState(false);
    const [batchError, setBatchError] = useState<string | null>(null);
    const [reviewLightboxImg, setReviewLightboxImg] = useState<string | null>(null);

    const isSameOrder = (rOrder: any, currentOrder: any) => {
        if (!rOrder || !currentOrder) return false;
        const currentIds = [currentOrder.id, currentOrder._id, currentOrder.publicId].filter(Boolean);
        if (typeof rOrder === "string") {
            return currentIds.includes(rOrder);
        }
        if (typeof rOrder === "object") {
            const rIds = [rOrder.id, rOrder._id, rOrder.publicId].filter(Boolean);
            return rIds.some((rId) => currentIds.includes(rId));
        }
        return false;
    };

    const checkIsReviewed = (productId: string) => {
        if (!order) return false;
        return myReviews.some((r) => {
            const matchProduct =
                r.product?.id === productId ||
                r.product?._id === productId ||
                (typeof r.product === "string" && r.product === productId);
            return matchProduct && isSameOrder(r.order, order);
        });
    };

    const getReviewInfo = (productId: string) => {
        if (!order) return null;
        return myReviews.find((r) => {
            const matchProduct =
                r.product?.id === productId ||
                r.product?._id === productId ||
                (typeof r.product === "string" && r.product === productId);
            return matchProduct && isSameOrder(r.order, order);
        }) || null;
    };

    const allReviewed = order?.items.every((item) => {
        const pid = item.product?.id || item.product?._id;
        return pid ? checkIsReviewed(pid) : false;
    }) ?? false;

    // Initialize batch review state when modal opens
    useEffect(() => {
        if (!isOpen || !order) return;
        const initial: Record<
            string,
            {
                rating: number;
                comment: string;
                selected: boolean;
                images: string[];
                video: string | null;
            }
        > = {};
        order.items.forEach((item) => {
            const pid = item.product?.id || item.product?._id;
            if (pid && !checkIsReviewed(pid)) {
                initial[pid] = {
                    rating: 5,
                    comment: "",
                    selected: true,
                    images: [],
                    video: null,
                };
            }
        });
        setBatchReviews(initial);
        setBatchError(null);
    }, [isOpen, order]);

    const handleReviewImagesUpload = async (pid: string, files: FileList | null) => {
        if (!files || files.length === 0) return;
        const currentImages = batchReviews[pid]?.images || [];
        if (currentImages.length >= 5) {
            setBatchError("Mỗi sản phẩm chỉ được tải lên tối đa 5 hình ảnh.");
            return;
        }

        const remainingSlots = 5 - currentImages.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        setBatchReviews((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], uploadingImages: true },
        }));
        setBatchError(null);

        const newUploaded: string[] = [];
        for (const file of filesToUpload) {
            if (file.size > 5 * 1024 * 1024) {
                setBatchError(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
                continue;
            }
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetchWithAuth(`${API_URL}/reviews/upload-image`, {
                    method: "POST",
                    body: formData,
                });
                if (res.ok) {
                    const json = await res.json();
                    let rawUrl = "";
                    if (typeof json === "string") rawUrl = json;
                    else if (typeof json.data === "string") rawUrl = json.data;
                    else if (json.data?.data) rawUrl = json.data.data;
                    else if (json.data?.url) rawUrl = json.data.url;
                    if (rawUrl) newUploaded.push(rawUrl);
                }
            } catch (err) {
                console.error("Lỗi tải ảnh review:", err);
            }
        }

        setBatchReviews((prev) => ({
            ...prev,
            [pid]: {
                ...prev[pid],
                images: [...(prev[pid]?.images || []), ...newUploaded],
                uploadingImages: false,
            },
        }));
    };

    const handleReviewRemoveImage = (pid: string, index: number) => {
        setBatchReviews((prev) => ({
            ...prev,
            [pid]: {
                ...prev[pid],
                images: (prev[pid]?.images || []).filter((_, i) => i !== index),
            },
        }));
    };

    const handleReviewVideoUpload = async (pid: string, file: File) => {
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            setBatchError("Video vượt quá dung lượng tối đa 50MB.");
            return;
        }

        const localUrl = URL.createObjectURL(file);
        const duration = await new Promise<number>((resolve) => {
            const vid = document.createElement("video");
            vid.preload = "metadata";
            vid.onloadedmetadata = () => {
                resolve(vid.duration);
                URL.revokeObjectURL(localUrl);
            };
            vid.onerror = () => resolve(0);
            vid.src = localUrl;
        });

        if (duration > 60) {
            setBatchError(
                `Video vượt quá thời lượng tối đa 60 giây (video của bạn: ${Math.round(duration)}s).`
            );
            return;
        }

        setBatchReviews((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], uploadingVideo: true },
        }));
        setBatchError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetchWithAuth(`${API_URL}/reviews/upload-video`, {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                const json = await res.json();
                let rawUrl = "";
                if (typeof json === "string") rawUrl = json;
                else if (typeof json.data === "string") rawUrl = json.data;
                else if (json.data?.data) rawUrl = json.data.data;
                else if (json.data?.url) rawUrl = json.data.url;
                if (rawUrl) {
                    setBatchReviews((prev) => ({
                        ...prev,
                        [pid]: { ...prev[pid], video: rawUrl },
                    }));
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                setBatchError(errData.message || "Không thể tải video lên.");
            }
        } catch (err) {
            setBatchError("Lỗi kết nối khi tải video.");
        } finally {
            setBatchReviews((prev) => ({
                ...prev,
                [pid]: { ...prev[pid], uploadingVideo: false },
            }));
        }
    };

    const handleReviewRemoveVideo = (pid: string) => {
        setBatchReviews((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], video: null },
        }));
    };

    const handleBatchSubmit = async () => {
        if (!order) return;
        const targetOrderId = order.id || order._id || order.publicId;

        // Chỉ lọc các sản phẩm được tích chọn
        const selectedEntries = Object.entries(batchReviews).filter(
            ([_, val]) => val.selected
        );

        if (selectedEntries.length === 0) {
            setBatchError("Vui lòng chọn ít nhất 1 sản phẩm để gửi đánh giá.");
            return;
        }

        setSubmittingBatch(true);
        setBatchError(null);

        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: targetOrderId,
                    reviews: selectedEntries.map(([productId, val]) => ({
                        productId,
                        rating: val.rating,
                        comment: val.comment.trim() || `Đánh giá ${val.rating} sao`,
                        images: val.images || [],
                        video: val.video || undefined,
                    })),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gửi đánh giá thất bại.");
            }

            onClose();
            await onSuccess();
        } catch (err: any) {
            setBatchError(err.message || "Đã xảy ra lỗi.");
        } finally {
            setSubmittingBatch(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 px-3 sm:px-6 md:px-8 pt-28 sm:pt-32 pb-4 sm:pb-6 backdrop-blur-sm overflow-hidden">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-[#ede0c4] overflow-hidden"
                    style={{ maxHeight: "calc(100dvh - 8rem)" }}
                >
                    {/* Header */}
                    <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
                        <div>
                            <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-[1px] font-sans">
                                Đánh giá đơn hàng
                            </h3>
                            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                                Mã đơn: <span className="font-mono text-[#c4a84f]">{order.publicId}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 bg-transparent border-none rounded-full cursor-pointer text-lg leading-none transition-colors"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Scrollable product list */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 font-sans modal-scroll">
                        {(() => {
                            const reviewableItemsCount = order.items.filter((item) => {
                                const pid = item.product?.id || item.product?._id;
                                return pid && !checkIsReviewed(pid);
                            }).length;

                            return order.items.map((item, idx) => {
                                const p = item.product;
                                const pid = p?.id || p?._id || "";
                                const imgUrl = p?.imageUrl?.[0] || "https://placehold.co/64x64";
                                const alreadyReviewed = checkIsReviewed(pid);
                                const reviewInfo = alreadyReviewed ? getReviewInfo(pid) : null;
                                const entry = batchReviews[pid];
                                const isSelected = entry?.selected ?? false;

                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-4 transition-all ${alreadyReviewed
                                            ? "bg-green-50/60 border-green-200"
                                            : isSelected
                                                ? "bg-white border-[#ede0c4] shadow-sm"
                                                : "bg-gray-50/70 border-dashed border-gray-300 opacity-60"
                                            }`}
                                    >
                                        {/* Product info row & Checkbox */}
                                        <div className="flex gap-3 items-center mb-3">
                                            {!alreadyReviewed && entry && reviewableItemsCount > 1 && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) =>
                                                        setBatchReviews((prev) => ({
                                                            ...prev,
                                                            [pid]: { ...prev[pid], selected: e.target.checked },
                                                        }))
                                                    }
                                                    title="Tích chọn để đánh giá sản phẩm này"
                                                    className="w-5 h-5 accent-[#c4a84f] rounded cursor-pointer flex-shrink-0"
                                                />
                                            )}
                                            <div className="relative w-14 h-14 flex-shrink-0 border border-[#ede0c4] rounded-lg overflow-hidden bg-[#faf7f2]">
                                                <ImageWithFallback
                                                    src={imgUrl}
                                                    alt={p?.productName || "Sản phẩm"}
                                                    fill
                                                    className="object-cover"
                                                    sizes="56px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-sm font-bold text-[#2c1a00] line-clamp-1 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-all]"
                                                    title={p?.productName || "Sản phẩm"}
                                                >
                                                    {p?.productName || "Sản phẩm"}
                                                </p>
                                                {p?.sku && (
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        SKU: {p.sku}
                                                    </span>
                                                )}
                                            </div>
                                            {alreadyReviewed ? (
                                                <div className="flex-shrink-0 flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 whitespace-nowrap">
                                                    <svg
                                                        className="w-3 h-3"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2.5}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    Đã đánh giá
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-[11px] font-semibold flex-shrink-0 whitespace-nowrap ${isSelected ? "text-[#c4a84f]" : "text-gray-400"
                                                        }`}
                                                >
                                                    {isSelected ? "Bật đánh giá" : "Bỏ qua lần này"}
                                                </span>
                                            )}
                                        </div>

                                        {alreadyReviewed && reviewInfo ? (
                                            /* Hiển thị đánh giá đã gửi */
                                            <div className="bg-white rounded-lg border border-green-200 p-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-amber-500 text-sm tracking-widest">
                                                        {"★".repeat(reviewInfo.rating)}
                                                        {"☆".repeat(5 - reviewInfo.rating)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-sans">
                                                        {STAR_LABELS[reviewInfo.rating]}
                                                    </span>
                                                </div>
                                                {reviewInfo.comment && (
                                                    <p className="text-xs text-gray-600 italic leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                                        &ldquo;{reviewInfo.comment}&rdquo;
                                                    </p>
                                                )}
                                                {reviewInfo.images && reviewInfo.images.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {reviewInfo.images.map((img: string, i: number) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => setReviewLightboxImg(formatImageUrl(img))}
                                                                className="w-14 h-14 rounded-lg overflow-hidden border border-[#ede0c4] bg-[#faf7f2] hover:border-[#c4a84f] transition cursor-zoom-in"
                                                            >
                                                                <img
                                                                    src={formatImageUrl(img)}
                                                                    alt={`Ảnh ${i + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {reviewInfo.video && (
                                                    <div className="pt-1 max-w-xs rounded-lg overflow-hidden border border-[#ede0c4] bg-black">
                                                        <video
                                                            src={formatVideoUrl(reviewInfo.video)}
                                                            controls
                                                            preload="metadata"
                                                            className="w-full max-h-36 object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : entry && isSelected ? (
                                            /* Form đánh giá khi được tích chọn */
                                            <div className="space-y-3.5 pt-1 border-t border-gray-100">
                                                {/* Star Picker */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                        Mức độ hài lòng
                                                    </label>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() =>
                                                                    setBatchReviews((prev) => ({
                                                                        ...prev,
                                                                        [pid]: { ...prev[pid], rating: star },
                                                                    }))
                                                                }
                                                                className={`text-2xl transition-all cursor-pointer bg-transparent border-none p-0.5 leading-none ${star <= entry.rating
                                                                    ? "text-amber-500 scale-110"
                                                                    : "text-gray-300 hover:text-amber-400"
                                                                    }`}
                                                            >
                                                                ★
                                                            </button>
                                                        ))}
                                                        <span className="text-xs font-semibold text-[#c4a84f] ml-2">
                                                            {STAR_LABELS[entry.rating]}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Comment */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            Nhận xét{" "}
                                                            <span className="text-gray-300 font-normal normal-case">
                                                                (tùy chọn)
                                                            </span>
                                                        </label>
                                                        <span
                                                            className={`text-[11px] font-sans transition-colors ${(entry.comment || "").length >= 950
                                                                ? "text-amber-600 font-bold"
                                                                : "text-gray-400"
                                                                }`}
                                                        >
                                                            {(entry.comment || "").length}/1000
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        value={entry.comment}
                                                        maxLength={1000}
                                                        onChange={(e) =>
                                                            setBatchReviews((prev) => ({
                                                                ...prev,
                                                                [pid]: {
                                                                    ...prev[pid],
                                                                    comment: e.target.value.slice(0, 1000),
                                                                },
                                                            }))
                                                        }
                                                        placeholder={`Chia sẻ cảm nhận của bạn về ${p?.productName && p.productName.length > 25
                                                            ? p.productName.slice(0, 25) + "..."
                                                            : p?.productName || "sản phẩm"
                                                            }...`}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#c4a84f] focus:ring-2 focus:ring-[#c4a84f]/20 focus:outline-none text-sm font-sans resize-none transition"
                                                    />
                                                </div>

                                                {/* Media Upload */}
                                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                                    {/* Hình ảnh */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                                <ImageIcon className="w-3.5 h-3.5 text-[#c4a84f]" />
                                                                <span>Hình ảnh thực tế ({(entry.images || []).length}/5)</span>
                                                            </label>
                                                            <span className="text-[10px] text-gray-400">Tối đa 5MB/ảnh</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            {(entry.images || []).map((imgUrl, imgIdx) => (
                                                                <div
                                                                    key={imgIdx}
                                                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#ede0c4] bg-[#faf7f2] group"
                                                                >
                                                                    <img
                                                                        src={formatImageUrl(imgUrl)}
                                                                        alt={`Đánh giá ${imgIdx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleReviewRemoveImage(pid, imgIdx)}
                                                                        className="absolute top-1 right-1 w-4 h-4 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                                                                        title="Xóa ảnh"
                                                                    >
                                                                        <X className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {(entry.images || []).length < 5 && (
                                                                <label
                                                                    className={`w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#c4a84f] flex flex-col items-center justify-center cursor-pointer transition text-gray-400 hover:text-[#c4a84f] bg-white ${entry.uploadingImages ? "pointer-events-none opacity-50" : ""
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        className="hidden"
                                                                        disabled={entry.uploadingImages}
                                                                        onChange={(e) => {
                                                                            handleReviewImagesUpload(pid, e.target.files);
                                                                            e.target.value = "";
                                                                        }}
                                                                    />
                                                                    {entry.uploadingImages ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin text-[#c4a84f]" />
                                                                    ) : (
                                                                        <>
                                                                            <Camera className="w-4 h-4 mb-0.5" />
                                                                            <span className="text-[9px] font-bold uppercase">Thêm ảnh</span>
                                                                        </>
                                                                    )}
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Video */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                                <Video className="w-3.5 h-3.5 text-[#8b2500]" />
                                                                <span>Video thực tế (1 video)</span>
                                                            </label>
                                                            <span className="text-[10px] text-gray-400">Tối đa 50MB · ≤60s</span>
                                                        </div>
                                                        {entry.video ? (
                                                            <div className="relative rounded-xl overflow-hidden border border-[#ede0c4] bg-black w-full shadow-sm group">
                                                                <video
                                                                    src={formatVideoUrl(entry.video)}
                                                                    controls
                                                                    preload="metadata"
                                                                    className="w-full max-h-48 object-contain"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReviewRemoveVideo(pid)}
                                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition cursor-pointer shadow"
                                                                    title="Xóa video"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-[#8b2500] hover:text-[#8b2500] text-gray-600 text-xs font-semibold bg-white cursor-pointer transition ${entry.uploadingVideo ? "pointer-events-none opacity-50" : ""
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="file"
                                                                    accept="video/mp4,video/mov,video/webm,video/*"
                                                                    className="hidden"
                                                                    disabled={entry.uploadingVideo}
                                                                    onChange={(e) => {
                                                                        const f = e.target.files?.[0];
                                                                        if (f) handleReviewVideoUpload(pid, f);
                                                                        e.target.value = "";
                                                                    }}
                                                                />
                                                                {entry.uploadingVideo ? (
                                                                    <>
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8b2500]" />
                                                                        <span>Đang tải video lên Cloudinary...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Video className="w-3.5 h-3.5 text-[#8b2500]" />
                                                                        <span>+ Thêm video mở hộp / dùng thử</span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : entry && !isSelected ? (
                                            <p className="text-xs text-gray-400 italic m-0 pt-1">
                                                Tích chọn ở góc trái nếu muốn gửi đánh giá cho sản phẩm này.
                                            </p>
                                        ) : null}
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 bg-[#fbfaf8] border-t border-[#ede0c4] px-5 py-4">
                        {batchError && (
                            <p className="text-xs text-red-500 font-semibold font-sans mb-3">{batchError}</p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submittingBatch}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold tracking-[1px] uppercase rounded-lg hover:bg-gray-50 transition font-sans cursor-pointer disabled:opacity-50"
                            >
                                Đóng
                            </button>
                            {!allReviewed && (
                                <button
                                    type="button"
                                    onClick={handleBatchSubmit}
                                    disabled={
                                        submittingBatch ||
                                        Object.values(batchReviews).some((r) => r.selected && (r.uploadingImages || r.uploadingVideo)) ||
                                        Object.values(batchReviews).filter((r) => r.selected).length === 0
                                    }
                                    className="px-6 py-2.5 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[1.5px] uppercase rounded-lg transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed font-sans cursor-pointer flex items-center gap-2"
                                >
                                    {submittingBatch ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Gửi {Object.values(batchReviews).filter((r) => r.selected).length} đánh giá
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Lightbox Image */}
            {reviewLightboxImg && (
                <div
                    className="fixed inset-0 bg-black/85 z-[100000] flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setReviewLightboxImg(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-black">
                        <img
                            src={reviewLightboxImg}
                            alt="Phóng to ảnh đánh giá"
                            className="w-full h-full object-contain max-h-[85vh]"
                        />
                        <button
                            type="button"
                            onClick={() => setReviewLightboxImg(null)}
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
