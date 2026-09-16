"use client";

import React from "react";
import Link from "next/link";

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "₫";

interface CartOrderSummaryProps {
  selectedCount: number;
  selectedSummary: { subtotal: number; itemCount: number };
  loginWarning: boolean;
  onCheckout: () => void;
}

export default function CartOrderSummary({
  selectedCount,
  selectedSummary,
  loginWarning,
  onCheckout,
}: CartOrderSummaryProps) {
  return (
    <div className="bg-white border border-[#ede0c4] rounded p-6 shadow-sm sticky top-[120px] mx-4 sm:mx-0">
      <h2
        className="text-base font-bold text-[#2c1a00] uppercase tracking-wide border-b border-[#ede0c4] pb-3 mb-5"
        style={serif}
      >
        Thông tin đơn hàng
      </h2>

      {selectedCount === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3 italic" style={serif}>
          Vui lòng chọn sản phẩm để thanh toán.
        </p>
      ) : (
        <div className="flex flex-col gap-3 text-sm border-b border-[#ede0c4] pb-4 mb-4" style={serif}>
          <div className="flex justify-between text-gray-500">
            <span>Đã chọn ({selectedSummary.itemCount} sản phẩm):</span>
            <span className="font-semibold text-gray-700">{fmt(selectedSummary.subtotal)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-base font-bold mb-2" style={serif}>
        <span className="uppercase tracking-wide text-[#2c1a00]">Tổng tiền:</span>
        <span className="text-xl font-bold text-red-600">
          {selectedCount > 0 ? fmt(selectedSummary.subtotal) : "0₫"}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 italic mb-4" style={serif}>
        * Phí vận chuyển sẽ được tính khi thanh toán.
      </p>

      <div className="flex flex-col gap-3">
        {selectedCount > 0 ? (
          <button
            type="button"
            onClick={onCheckout}
            className="flex items-center justify-center rounded border border-[#d29f13] bg-[#d29f13] py-4 text-xs font-bold tracking-[2px] uppercase text-white transition-colors duration-200 hover:bg-white hover:text-[#2c1a00] cursor-pointer"
            style={serif}
          >
            Thanh toán ({selectedCount} sản phẩm)
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex items-center justify-center rounded border border-[#ddd] bg-[#f0ebe0] py-4 text-xs font-bold tracking-[2px] uppercase text-[#bbb] cursor-not-allowed"
            style={serif}
          >
            Chọn sản phẩm để thanh toán
          </button>
        )}

        {/* Banner cảnh báo chưa đăng nhập */}
        {loginWarning && (
          <div className="flex flex-col gap-2.5 bg-amber-50 border border-amber-300 rounded-lg p-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-start gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#92400e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-xs text-amber-800 font-semibold leading-relaxed" style={serif}>
                Bạn cần <strong>đăng nhập</strong> để tiến hành thanh toán!
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-login-modal"))}
              className="w-full py-2.5 rounded bg-[#c4a84f] text-white text-xs font-bold tracking-[1.5px] uppercase hover:bg-[#a8893a] transition-colors cursor-pointer"
              style={serif}
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        <Link
          href="/products/all"
          className="inline-flex items-center gap-2 text-[#8b6914] hover:text-[#c4a84f] no-underline text-xs font-semibold tracking-[1px] uppercase transition-colors duration-200 pt-1 justify-center"
          style={serif}
        >
          <span className="text-base">←</span>
          Tiếp tục mua hàng
        </Link>
      </div>
    </div>
  );
}
