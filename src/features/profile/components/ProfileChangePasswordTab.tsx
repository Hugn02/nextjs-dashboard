"use client";

import React, { ChangeEvent } from "react";
import { User } from "@/src/features/auth/types/auth.types";

interface ProfileChangePasswordTabProps {
    user: User;
    changePasswordData: {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    isChangingPassword: boolean;
    changePasswordMessage: { text: string; type: "success" | "error" } | null;
    showOldPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    setShowOldPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
    setShowNewPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
    setShowConfirmPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
    onPasswordInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangePasswordSubmit: () => void;
}

export default function ProfileChangePasswordTab({
    user,
    changePasswordData,
    isChangingPassword,
    changePasswordMessage,
    showOldPassword,
    showNewPassword,
    showConfirmPassword,
    setShowOldPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    onPasswordInputChange,
    onChangePasswordSubmit,
}: ProfileChangePasswordTabProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="border-b border-[#ede0c4] pb-3">
                <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Bảo mật tài khoản</h3>
                <p className="text-xs text-gray-400 mt-0.5">Quản lý bảo mật và đăng nhập của tài khoản</p>
            </div>

            {user.provider === "google" ? (
                <div className="p-6 bg-gradient-to-r from-blue-50/50 via-[#fcfbfa] to-amber-50/30 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-[#2c1a00] text-sm mb-1">Tài khoản liên kết Google</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                            Tài khoản của bạn đăng nhập trực tiếp thông qua Google. Mật khẩu và bảo mật hai lớp được quản lý an toàn bởi Google. Bạn không cần phải tạo hoặc đổi mật khẩu trên hệ thống Nghệ Nhân Bát Tràng.
                        </p>
                        <a
                            href="https://myaccount.google.com/security"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-[#f0f7ff] border border-blue-200 px-3.5 py-2 rounded-lg hover:bg-blue-100 transition-colors no-underline"
                        >
                            <span>Quản lý bảo mật tài khoản Google</span>
                            <span>↗</span>
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    {changePasswordMessage && (
                        <div
                            className={`p-3 rounded text-xs ${
                                changePasswordMessage.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                        >
                            {changePasswordMessage.text}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onChangePasswordSubmit();
                        }}
                        className="flex flex-col gap-4 text-xs md:text-sm max-w-md"
                    >
                        {[
                            { key: "oldPassword", label: "Mật khẩu cũ:", show: showOldPassword, setShow: setShowOldPassword, placeholder: "Nhập mật khẩu cũ" },
                            { key: "newPassword", label: "Mật khẩu mới:", show: showNewPassword, setShow: setShowNewPassword, placeholder: "Nhập mật khẩu mới" },
                            { key: "confirmPassword", label: "Xác nhận mật khẩu:", show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: "Nhập lại mật khẩu mới" },
                        ].map(({ key, label, show, setShow, placeholder }) => (
                            <div key={key} className="relative w-full">
                                <label className="block text-gray-500 font-medium mb-1.5">{label}</label>
                                <input
                                    type={show ? "text" : "password"}
                                    name={key}
                                    placeholder={placeholder}
                                    value={changePasswordData[key as keyof typeof changePasswordData]}
                                    onChange={onPasswordInputChange}
                                    className="w-full px-3 py-2 border border-[#ddd] rounded text-sm outline-none bg-white focus:ring-1 focus:ring-[#c4a84f] pr-14"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3 top-[38px] border-none bg-transparent cursor-pointer text-[#c4a84f] hover:text-[#a8893a] text-xs font-semibold"
                                >
                                    {show ? "Ẩn" : "Hiện"}
                                </button>
                            </div>
                        ))}

                        <div className="text-left text-xs space-y-1.5 text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="font-semibold text-slate-600 mb-1">Yêu cầu mật khẩu mới:</p>
                            {[
                                [changePasswordData.newPassword.length >= 8, "Tối thiểu 8 ký tự"],
                                [/(?=.*[A-Z])/.test(changePasswordData.newPassword), "Chứa ít nhất 1 chữ hoa"],
                                [/(?=.*\d)/.test(changePasswordData.newPassword), "Chứa ít nhất 1 chữ số"],
                                [/(?=.*[!@#$%^&*])/.test(changePasswordData.newPassword), "Chứa ít nhất 1 ký tự đặc biệt"],
                            ].map(([ok, text], i) => (
                                <div key={i} className={`flex items-center gap-1.5 ${ok ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                                    {ok ? "✓" : "○"} {text as string}
                                </div>
                            ))}
                        </div>

                        <div className="mt-2">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="px-6 py-2.5 bg-[#c4a84f] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] border-none cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isChangingPassword ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
