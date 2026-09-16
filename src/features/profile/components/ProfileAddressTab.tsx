"use client";

import React from "react";
import type { UserLocation } from "@/src/features/location/types/location.types";

interface ProfileAddressTabProps {
    locations: UserLocation[];
    loadingLocations: boolean;
    locationError: string | null;
    onAddNewAddress: () => void;
    onEditAddress: (loc: UserLocation) => void;
    onSetDefaultAddress: (id: string) => void;
    onDeleteAddress: (loc: UserLocation) => void;
}

const formatPhone = (phone?: string) => {
    if (!phone) return "";
    const trimmed = phone.trim();
    if (trimmed.startsWith("0")) return `(+84) ${trimmed.slice(1)}`;
    return trimmed;
};

export default function ProfileAddressTab({
    locations,
    loadingLocations,
    locationError,
    onAddNewAddress,
    onEditAddress,
    onSetDefaultAddress,
    onDeleteAddress,
}: ProfileAddressTabProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#ede0c4] pb-3">
                <div>
                    <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Địa chỉ của tôi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Quản lý địa chỉ giao nhận hàng của bạn</p>
                </div>
                <button
                    type="button"
                    onClick={onAddNewAddress}
                    className="px-3.5 py-2 rounded bg-[#c4a84f] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors border-none cursor-pointer"
                >
                    + Thêm địa chỉ mới
                </button>
            </div>

            {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                    {locationError}
                </div>
            )}

            {loadingLocations ? (
                <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải danh sách địa chỉ...</div>
            ) : locations.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded">
                    Bạn chưa có địa chỉ lưu trữ nào.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {locations.map((loc) => (
                        <div
                            key={loc.id}
                            className={`p-3.5 rounded-lg border flex justify-between items-start gap-3 transition-all ${
                                loc.isDefault ? "border-[#c4a84f] bg-[#fffcf8]" : "border-[#ede0c4] bg-white"
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-[#1a1a1a] text-xs sm:text-sm">{loc.receiverName}</span>
                                    <span className="text-gray-300 text-xs">|</span>
                                    <span className="text-gray-600 font-semibold text-xs">{formatPhone(loc.phone)}</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {loc.address}, {loc.wardName}, {loc.districtName}, {loc.provinceName}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    {loc.isDefault && (
                                        <span className="inline-flex items-center border border-red-200 bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-semibold">
                                            Mặc định
                                        </span>
                                    )}
                                    <span className="inline-flex items-center bg-[#faf6ed] border border-[#ede0c4] text-[#8b6914] text-[10px] px-2 py-0.5 rounded font-medium">
                                        {loc.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEditAddress(loc)}
                                    className="text-xs text-[#c4a84f] hover:underline font-medium border-none bg-transparent cursor-pointer"
                                >
                                    Cập nhật
                                </button>
                                {!loc.isDefault && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onSetDefaultAddress(loc.id)}
                                            className="text-xs text-blue-500 hover:underline font-medium border-none bg-transparent cursor-pointer"
                                        >
                                            Thiết lập mặc định
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteAddress(loc)}
                                            className="text-xs text-red-500 hover:underline font-medium border-none bg-transparent cursor-pointer"
                                        >
                                            Xóa
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
