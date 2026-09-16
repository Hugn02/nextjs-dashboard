"use client";

import React, { Dispatch, FormEvent, RefObject, SetStateAction } from "react";
import { User } from "@/src/features/auth/types/auth.types";
import { formatImageUrl } from "@/src/lib/cloudinary";

interface ProfileInfoTabProps {
    user: User;
    profileForm: {
        fullName: string;
        phone: string;
        gender: "" | "male" | "female" | "other";
        dateOfBirth: string;
    };
    setProfileForm: Dispatch<SetStateAction<{
        fullName: string;
        phone: string;
        gender: "" | "male" | "female" | "other";
        dateOfBirth: string;
    }>>;
    message: { text: string; type: "success" | "error" } | null;
    isSavingProfile: boolean;
    avatarUploading: boolean;
    avatarInputRef: RefObject<HTMLInputElement | null>;
    onSaveProfile: (e: FormEvent) => void;
    onRemoveAvatar: () => void;
    onOpenAvatarPreview: () => void;
}

export default function ProfileInfoTab({
    user,
    profileForm,
    setProfileForm,
    message,
    isSavingProfile,
    avatarUploading,
    avatarInputRef,
    onSaveProfile,
    onRemoveAvatar,
    onOpenAvatarPreview,
}: ProfileInfoTabProps) {
    const avatarInitial = user.fullName
        ? user.fullName.charAt(0).toUpperCase()
        : user.email.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col gap-5">
            <div className="border-b border-[#ede0c4] pb-3">
                <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Hồ sơ của tôi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>

            {message && (
                <div
                    className={`p-3 rounded text-xs ${
                        message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Avatar upload section */}
            <div className="flex items-center gap-4 p-4 bg-[#faf8f5] rounded-xl border border-[#ede0c4]">
                <div
                    className="relative w-20 h-20 rounded-full flex-shrink-0 cursor-pointer group"
                    onClick={() => (user.avatar ? onOpenAvatarPreview() : avatarInputRef.current?.click())}
                    title={user.avatar ? "Bấm để xem ảnh phóng to" : "Bấm để chọn ảnh"}
                >
                    {user.avatar ? (
                        <img
                            src={formatImageUrl(user.avatar, { width: 200 })}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border-2 border-[#c4a84f]/40"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#f7f3eb] rounded-full flex items-center justify-center border-2 border-[#c4a84f]/40 text-[#c4a84f] font-bold text-2xl">
                            {avatarInitial}
                        </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.avatar ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                    {avatarUploading && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={avatarUploading}
                            className="px-4 py-2 border border-[#c4a84f] text-[#c4a84f] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#c4a84f] hover:text-white transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                        >
                            {avatarUploading ? "Đang tải lên..." : "Chọn ảnh"}
                        </button>
                        {user.avatar && (
                            <button
                                type="button"
                                onClick={onRemoveAvatar}
                                disabled={avatarUploading}
                                className="px-4 py-2 border border-red-300 text-red-500 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                            >
                                Xóa ảnh
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400">Tối đa 5MB. Định dạng JPG, PNG, WebP.</p>
                </div>
            </div>

            {/* Profile form */}
            <form onSubmit={onSaveProfile} className="flex flex-col gap-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Họ và tên:</label>
                    <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Nhập họ và tên..."
                        className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f]"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Email:</label>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{user.email}</span>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            Đã xác minh
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Số điện thoại:</label>
                    <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="VD: 0987654321"
                        className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f]"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Giới tính:</label>
                    <div className="flex gap-4">
                        {(
                            [
                                ["male", "Nam"],
                                ["female", "Nữ"],
                                ["other", "Khác"],
                            ] as const
                        ).map(([val, label]) => (
                            <label key={val} className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={val}
                                    checked={profileForm.gender === val}
                                    onChange={() => setProfileForm((prev) => ({ ...prev, gender: val }))}
                                    className="accent-[#c4a84f]"
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Ngày sinh:</label>
                    <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:border-[#c4a84f] focus:ring-1 focus:ring-[#c4a84f] w-fit"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] items-center gap-2">
                    <label className="text-gray-500 font-medium">Vai trò:</label>
                    <span className="inline-block w-fit px-2.5 py-1 bg-[#c4a84f]/10 text-[#c4a84f] text-[11px] font-bold uppercase tracking-widest rounded">
                        {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "Quản trị viên" : "Thành viên"}
                    </span>
                </div>

                <div className="pt-2 border-t border-[#f3ebdb]">
                    <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-2.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}
