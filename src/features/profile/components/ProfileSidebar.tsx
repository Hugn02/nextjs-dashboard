"use client";

import React, { ChangeEvent, RefObject } from "react";
import { User } from "@/src/features/auth/types/auth.types";
import { formatImageUrl } from "@/src/lib/cloudinary";

interface ProfileSidebarProps {
    user: User;
    profileTab: "info" | "address" | "orders" | "change-password";
    avatarUploading: boolean;
    avatarInputRef: RefObject<HTMLInputElement | null>;
    onTabChange: (tab: "info" | "address" | "orders" | "change-password") => void;
    onAvatarUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onOpenAvatarPreview: () => void;
}

export default function ProfileSidebar({
    user,
    profileTab,
    avatarUploading,
    avatarInputRef,
    onTabChange,
    onAvatarUpload,
    onOpenAvatarPreview,
}: ProfileSidebarProps) {
    const avatarInitial = user.fullName
        ? user.fullName.charAt(0).toUpperCase()
        : user.email.charAt(0).toUpperCase();

    return (
        <aside className="flex flex-col border-b md:border-b-0 md:border-r border-[#eee] pb-4 md:pb-0 md:pr-5 gap-4">
            {/* Avatar mini + info */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#f3ebdb]">
                <div
                    className="relative w-11 h-11 rounded-full flex-shrink-0 cursor-pointer group"
                    onClick={() => (user.avatar ? onOpenAvatarPreview() : avatarInputRef.current?.click())}
                    title={user.avatar ? "Bấm để xem ảnh phóng to" : "Bấm để tải ảnh đại diện"}
                >
                    {user.avatar ? (
                        <img
                            src={formatImageUrl(user.avatar, { width: 100 })}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border border-[#c4a84f]/30"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#f7f3eb] rounded-full flex items-center justify-center border border-[#c4a84f]/30 text-[#c4a84f] font-bold text-base">
                            {avatarInitial}
                        </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.avatar ? (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <span className="text-white text-[10px] font-bold">Thêm</span>
                        )}
                    </div>
                    {avatarUploading && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#2c1a00] text-sm truncate">{user.fullName || "Chưa cập nhật"}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    {!user.profileCompleted && (
                        <span className="text-[10px] text-amber-600 font-medium">● Hồ sơ chưa đầy đủ</span>
                    )}
                </div>
            </div>

            <nav className="flex flex-col gap-5 text-sm">
                <div>
                    <div className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">Tài khoản của tôi</div>
                    <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                        {(["info", "address", "change-password"] as const)
                            .filter((tab) => !(tab === "change-password" && user?.provider === "google"))
                            .map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => onTabChange(tab)}
                                    className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${
                                        profileTab === tab ? "bg-[#faf6ed] text-[#c4a84f] font-bold" : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                                    }`}
                                >
                                    {tab === "info" ? "Hồ sơ" : tab === "address" ? "Địa chỉ" : "Đổi mật khẩu"}
                                </button>
                            ))}
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-2.5 px-2">Đơn mua</div>
                    <div className="flex flex-col gap-1 pl-3 border-l-2 border-[#f3ebdb]">
                        <button
                            type="button"
                            onClick={() => onTabChange("orders")}
                            className={`text-left px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors border-none bg-transparent cursor-pointer ${
                                profileTab === "orders" ? "bg-[#faf6ed] text-[#c4a84f] font-bold" : "text-gray-600 hover:text-[#c4a84f] hover:bg-[#faf7f2]"
                            }`}
                        >
                            Lịch sử đơn mua
                        </button>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
