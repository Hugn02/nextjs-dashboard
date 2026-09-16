"use client";

import React from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { Coupon } from "@/src/features/coupon/types/coupon.types";

interface CheckoutOrderSummaryProps {
  checkoutItems: any[];
  checkoutItemCount: number;
  checkoutSubtotal: number;
  checkoutShippingFee: number;
  discountAmount: number;
  checkoutTotal: number;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  validatingCoupon: boolean;
  couponError: string | null;
  couponSuccessMsg: string | null;
  onChangeCouponCode: (code: string) => void;
  onApplyCoupon: (code?: string) => void;
  onRemoveCoupon: () => void;
  onOpenCouponModal: () => void;
  formatPrice?: (n: number) => string;
}

export default function CheckoutOrderSummary({
  checkoutItems,
  checkoutItemCount,
  checkoutSubtotal,
  checkoutShippingFee,
  discountAmount,
  checkoutTotal,
  appliedCoupon,
  couponCodeInput,
  validatingCoupon,
  couponError,
  couponSuccessMsg,
  onChangeCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenCouponModal,
  formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫",
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] sticky top-6">
      <h2 className="text-base font-bold font-['Cormorant_Garamond',_serif] tracking-[1px] uppercase text-[#2c1a00] pb-3 border-b border-[#ede0c4] mb-4">
        Tóm tắt đơn hàng ({checkoutItemCount} sản phẩm)
      </h2>

      {/* Product Items */}
      <div className="max-h-[300px] overflow-y-auto pt-2 pb-4 pr-1 flex flex-col gap-4 border-b border-[#ede0c4] mb-4">
        {checkoutItems.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 font-sans">
            Không có sản phẩm nào được chọn.
          </p>
        ) : (
          checkoutItems.map((item, idx) => {
            const p = item.product;
            const isDeleted = !p || (!p.id && !p._id);
            const pid = isDeleted ? `deleted-${idx}` : p.id || p._id;
            const imageUrl = !isDeleted
              ? p?.imageUrl?.[0] || p?.images?.[0] || "https://placehold.co/80x80"
              : "";

            if (isDeleted) {
              return (
                <div
                  key={pid}
                  className="flex gap-3 items-center justify-between p-2 rounded bg-red-50/60 border border-red-200 font-sans"
                >
                  <div className="flex gap-3 items-center min-w-0 flex-1">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="w-full h-full bg-red-100/70 border border-red-200 rounded flex items-center justify-center overflow-hidden">
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 z-10 bg-red-600 text-white text-[9px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-red-600 line-clamp-1">
                        Sản phẩm không còn tồn tại
                      </h4>
                      <span className="text-[10px] text-red-400 block">
                        Đã bị xóa khỏi hệ thống
                      </span>
                    </div>
                  </div>
                  <span className="font-['Cormorant_Garamond',_serif] text-xs font-bold text-red-400 line-through flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={pid}
                className="flex gap-3 items-center justify-between font-sans"
              >
                <div className="flex gap-2.5 items-center min-w-0 flex-1">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="w-full h-full bg-[#faf7f2] border border-[#ede0c4] rounded overflow-hidden relative">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 z-10 bg-[#8b6914] text-white text-[9px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className="text-xs font-semibold text-[#2c1a00] line-clamp-1 break-words [overflow-wrap:anywhere] [word-break:break-all]"
                      title={p.name}
                    >
                      {p.name}
                    </h4>
                    {p.sku && (
                      <span className="text-[10px] text-gray-400 tracking-wide uppercase block">
                        SKU: {p.sku}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-800 flex-shrink-0 ml-2">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Coupon Section */}
      <div className="border-b border-[#ede0c4] pb-4 mb-4 font-sans">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b6914"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Mã giảm giá / Voucher</span>
          </span>
          <button
            type="button"
            onClick={onOpenCouponModal}
            className="text-xs font-bold text-[#8b6914] hover:underline cursor-pointer"
          >
            Chọn voucher →
          </button>
        </div>

        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCodeInput}
              onChange={(e) => onChangeCouponCode(e.target.value.toUpperCase())}
              placeholder="MÃ GIẢM GIÁ"
              className="flex-1 border border-[#ede0c4] rounded px-3 py-2 text-xs font-mono uppercase bg-[#faf8f5] focus:outline-none focus:border-[#c4a84f] placeholder:text-gray-400"
            />
            <button
              type="button"
              disabled={validatingCoupon || !couponCodeInput.trim()}
              onClick={() => onApplyCoupon()}
              className="bg-[#c4a84f] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#a8893a] transition-colors disabled:opacity-50 uppercase tracking-wider cursor-pointer"
            >
              {validatingCoupon ? "..." : "Áp dụng"}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {appliedCoupon.code}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  -{formatPrice(discountAmount)}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 block mt-0.5">
                {appliedCoupon.title}
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs font-bold text-red-500 hover:text-red-700 p-1 cursor-pointer"
              title="Bỏ sử dụng mã"
            >
              ✕
            </button>
          </div>
        )}

        {couponError && (
          <p className="text-[11px] text-red-600 mt-1.5 flex items-start gap-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{couponError}</span>
          </p>
        )}
        {couponSuccessMsg && !couponError && (
          <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{couponSuccessMsg}</span>
          </p>
        )}
      </div>

      {/* Pricing Totals */}
      <div className="flex flex-col gap-2.5 text-xs border-b border-[#ede0c4] pb-3.5 mb-3.5 font-sans">
        <div className="flex justify-between items-center text-gray-600">
          <span>Tạm tính:</span>
          <span className="font-bold text-gray-800">
            {formatPrice(checkoutSubtotal)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-700">
            <span>
              {appliedCoupon?.discountType === "FREE_SHIPPING"
                ? "Miễn phí vận chuyển:"
                : "Giảm giá (Voucher):"}
            </span>
            <span className="font-bold text-emerald-700">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-gray-600">
          <span>Phí vận chuyển:</span>
          <span className="font-bold text-gray-800">
            {checkoutShippingFee > 0
              ? formatPrice(checkoutShippingFee)
              : "Miễn phí"}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center font-sans">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2c1a00]">
          Tổng cộng:
        </span>
        <span className="text-base font-extrabold text-[#8b2500] tracking-tight">
          {formatPrice(checkoutTotal)}
        </span>
      </div>
    </div>
  );
}
