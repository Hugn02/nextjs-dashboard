"use client";

import React from "react";
import { formatImageUrl } from "@/src/lib/cloudinary";

interface ProfileAvatarPreviewModalProps {
    isOpen: boolean;
    avatarUrl?: string | null;
    onClose: () => void;
}

export default function ProfileAvatarPreviewModal({
    isOpen,
    avatarUrl,
    onClose,
}: ProfileAvatarPreviewModalProps) {
    if (!isOpen || !avatarUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative w-[90vw] sm:w-[500px] md:w-[560px] aspect-square rounded-2xl overflow-visible shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full bg-white text-gray-800 shadow-2xl font-bold flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all hover:scale-110 border-none z-20 text-base"
                    title="Đóng"
                >
                    ✕
                </button>
                <img
                    src={formatImageUrl(avatarUrl, { width: 1200 })}
                    alt="Avatar Xem Trước"
                    className="w-full h-full object-cover rounded-2xl shadow-2xl block border-2 border-white/20"
                />
            </div>
        </div>
    );
}
