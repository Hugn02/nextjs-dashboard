"use client";

import React from "react";
import { Truck } from "lucide-react";
import { ShippingFeeOption } from "@/src/features/checkout/services/checkout.service";

interface CheckoutShippingCarrierProps {
  shippingOptions: ShippingFeeOption[];
  selectedShippingProvider: string;
  onSelectProvider: (providerId: string) => void;
  shippingLoading: boolean;
}

export default function CheckoutShippingCarrier({
  shippingOptions,
  selectedShippingProvider,
  onSelectProvider,
  shippingLoading,
}: CheckoutShippingCarrierProps) {
  return (
    <div className="mt-4 p-4 bg-[#fbfaf8] border border-[#ede0c4] rounded">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 font-sans flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#c4a84f]" />
          <span>Đơn vị vận chuyển (Giao hàng)</span>
        </span>
        {shippingLoading && (
          <span className="text-xs text-amber-600 animate-pulse font-sans">
            Đang tính phí ship...
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {shippingOptions.length === 0 && !shippingLoading ? (
          <div className="text-xs text-gray-500 italic py-2 font-sans">
            Vui lòng chọn địa chỉ giao hàng để tải cước phí vận chuyển.
          </div>
        ) : (
          shippingOptions.map((opt) => {
            const isSelected = selectedShippingProvider === opt.providerId;
            return (
              <label
                key={opt.providerId}
                htmlFor={`provider-${opt.providerId}`}
                className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#fffdf7] border-[#c4a84f] ring-1 ring-[#c4a84f]/40 shadow-sm"
                    : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={`provider-${opt.providerId}`}
                    name="shippingProvider"
                    value={opt.providerId}
                    checked={isSelected}
                    onChange={() => onSelectProvider(opt.providerId)}
                    className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#2c1a00] font-sans flex items-center gap-2">
                      <span>{opt.providerName}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                        {opt.serviceName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 font-sans">
                      <span>Dự kiến: {opt.expectedDeliveryDate}</span>
                      {opt.description && (
                        <span className="text-gray-400 hidden sm:inline">
                          • {opt.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 font-sans">
                  <span
                    className={`text-sm font-bold ${
                      opt.fee === 0 ? "text-green-600 font-semibold" : "text-[#c4a84f]"
                    }`}
                  >
                    {opt.fee === 0 ? "Miễn phí" : `${opt.fee.toLocaleString("vi-VN")}₫`}
                  </span>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
