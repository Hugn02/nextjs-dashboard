"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Coupon, DiscountType } from "../types/coupon.types";
import { getAvailableCoupons } from "../services/coupon.service";

interface CouponSelectorModalProps {
  subtotal: number;
  selectedCode: string | null;
  onSelect: (coupon: Coupon) => void;
  onClose: () => void;
}

export default function CouponSelectorModal({
  subtotal,
  selectedCode,
  onSelect,
  onClose,
}: CouponSelectorModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    getAvailableCoupons(subtotal)
      .then(setCoupons)
      .finally(() => setLoading(false));
  }, [subtotal]);

  const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫";

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    const q = searchQuery.trim().toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [coupons, searchQuery]);

  const renderBadge = (coupon: Coupon) => {
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      return (
        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300">
          Giảm {coupon.discountValue}%
          {coupon.maxDiscountAmount ? ` (Tối đa ${formatPrice(coupon.maxDiscountAmount)})` : ""}
        </span>
      );
    }
    if (coupon.discountType === DiscountType.FIXED_AMOUNT) {
      return (
        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-300">
          Giảm {formatPrice(coupon.discountValue)}
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded border border-blue-300">
        Freeship
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-['Cormorant_Garamond',_serif]">
      <div className="bg-white rounded-xl border border-[#ede0c4] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede0c4] bg-[#faf8f5]">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <h3 className="text-lg font-bold text-[#2c1a00] uppercase tracking-wider">
              Chọn Mã Giảm Giá
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-[#ede0c4]">
          <div className="relative flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b6914"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên mã hoặc mã voucher để tìm..."
              className="w-full pl-9 pr-8 py-2 text-xs font-sans border border-[#ede0c4] rounded-lg bg-[#faf8f5] focus:outline-none focus:border-[#c4a84f] focus:bg-white transition-all text-[#2c1a00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-xs text-gray-400 hover:text-gray-600 font-sans p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 max-h-[55vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#c4a84f] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-sans text-gray-500">Đang tải danh sách voucher...</span>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-sans text-sm">
              {searchQuery ? "Không tìm thấy mã giảm giá phù hợp với từ khóa." : "Chưa có mã giảm giá nào phù hợp cho đơn hàng của bạn."}
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isMinOrderEligible = subtotal >= coupon.minOrderValue;
              const isUserLimitReached =
                coupon.userUsageLimit > 0 &&
                (coupon.currentUserUsageCount ?? 0) >= coupon.userUsageLimit;
              const isGlobalLimitReached =
                coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

              const isEligible = isMinOrderEligible && !isUserLimitReached && !isGlobalLimitReached;
              const isSelected = selectedCode?.toUpperCase() === coupon.code.toUpperCase();

              // Xử lý nút bấm và lý do không dùng được
              let buttonText = "DÙNG MÃ";
              let buttonStyle = "bg-[#c4a84f] hover:bg-[#a8893a] text-white cursor-pointer shadow-xs";
              let errorMessage: string | null = null;

              if (isSelected) {
                buttonText = "ĐÃ CHỌN";
                buttonStyle = "bg-emerald-600 text-white font-bold";
              } else if (isUserLimitReached) {
                buttonText = "ĐÃ DÙNG HẾT";
                buttonStyle = "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300";
                errorMessage = `Bạn đã sử dụng hết số lần giới hạn (${coupon.userUsageLimit} lần) của mã này.`;
              } else if (isGlobalLimitReached) {
                buttonText = "HẾT LƯỢT";
                buttonStyle = "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300";
                errorMessage = "Mã giảm giá đã hết tổng lượt sử dụng trên hệ thống.";
              } else if (!isMinOrderEligible) {
                buttonText = "CHƯA ĐỦ ĐIỀU KIỆN";
                buttonStyle = "bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-300";
                errorMessage = `Đơn tối thiểu ${formatPrice(coupon.minOrderValue)} (Còn thiếu ${formatPrice(coupon.minOrderValue - subtotal)})`;
              }

              return (
                <div
                  key={coupon.id || coupon._id || coupon.code}
                  className={`border rounded-lg p-4 flex flex-col gap-2.5 transition-all relative ${
                    isSelected
                      ? "border-[#c4a84f] bg-[#fffdf7] ring-1 ring-[#c4a84f]"
                      : isEligible
                      ? "border-[#ede0c4] bg-white hover:border-[#c4a84f]/60 shadow-xs"
                      : "border-gray-200 bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-[#8b6914] bg-[#fbf5e6] px-2 py-0.5 rounded border border-[#ede0c4]">
                          {coupon.code}
                        </span>
                        {renderBadge(coupon)}
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 font-sans">
                        {coupon.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      disabled={!isEligible || isSelected}
                      onClick={() => {
                        if (isEligible) {
                          onSelect(coupon);
                          onClose();
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider font-['Cormorant_Garamond',_serif] transition-colors ${buttonStyle}`}
                    >
                      {buttonText}
                    </button>
                  </div>

                  {coupon.description && (
                    <p className="text-xs text-gray-500 font-sans line-clamp-2">
                      {coupon.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-sans pt-2 border-t border-gray-100">
                    <span>
                      {coupon.minOrderValue > 0
                        ? `Đơn tối thiểu: ${formatPrice(coupon.minOrderValue)}`
                        : "Áp dụng cho mọi đơn hàng"}
                    </span>
                    <span>
                      HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Thông báo lý do không khả dụng / đủ điều kiện */}
                  {errorMessage ? (
                    <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded font-semibold font-sans flex items-center gap-1.5 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-red-600">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold font-sans flex items-center gap-1.5 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-emerald-700">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Đủ điều kiện áp dụng cho đơn hàng này</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ede0c4] bg-[#faf8f5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-800 font-sans cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
