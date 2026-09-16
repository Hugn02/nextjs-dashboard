"use client";

import React from "react";

export type PaymentMethodType = "cod" | "vnpay" | "momo";

interface CheckoutPaymentMethodProps {
  paymentMethod: PaymentMethodType;
  onChangePaymentMethod: (method: PaymentMethodType) => void;
}

export default function CheckoutPaymentMethod({
  paymentMethod,
  onChangePaymentMethod,
}: CheckoutPaymentMethodProps) {
  return (
    <div className="mt-4 p-4 bg-[#fbfaf8] border border-[#ede0c4] rounded">
      <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 font-sans">
        Phương thức thanh toán
      </span>
      <div className="flex flex-col gap-3">
        {/* COD */}
        <label
          htmlFor="cod"
          className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${
            paymentMethod === "cod"
              ? "bg-[#fffdf7] border-[#c4a84f]"
              : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => onChangePaymentMethod("cod")}
              className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c4a84f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              <span>Thanh toán khi nhận hàng (COD)</span>
            </span>
          </div>
        </label>

        {/* VNPay */}
        <label
          htmlFor="vnpay"
          className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${
            paymentMethod === "vnpay"
              ? "bg-[#fffdf7] border-[#c4a84f]"
              : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="vnpay"
              name="paymentMethod"
              value="vnpay"
              checked={paymentMethod === "vnpay"}
              onChange={() => onChangePaymentMethod("vnpay")}
              className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c4a84f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>Thanh toán qua VNPay (Thẻ ATM / QR Code / Visa)</span>
            </span>
          </div>
        </label>

        {/* MoMo */}
        <label
          htmlFor="momo"
          className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${
            paymentMethod === "momo"
              ? "bg-[#fffdf7] border-[#c4a84f]"
              : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="momo"
              name="paymentMethod"
              value="momo"
              checked={paymentMethod === "momo"}
              onChange={() => onChangePaymentMethod("momo")}
              className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c4a84f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Thanh toán qua Ví MoMo (App MoMo / MoMo QR Code)</span>
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
