"use client";

import React from "react";
import Link from "next/link";
import {
  CheckoutEstimateResponse,
  CheckoutItemStatus,
} from "../types/checkout-estimate.types";

interface Props {
  estimate: CheckoutEstimateResponse;
}

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function CheckoutEstimateIssuesBanner({ estimate }: Props) {
  const { canCheckout, summary, items } = estimate;

  // Lọc ra các sản phẩm có issue
  const itemsWithIssues = items.filter(
    (item) => item.status !== CheckoutItemStatus.VALID || item.issues.length > 0
  );

  if (itemsWithIssues.length === 0) {
    return null;
  }

  const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫";

  return (
    <div className="mb-6 flex flex-col gap-3">
      {/* Banner chính */}
      <div
        className={`p-4 rounded-lg border flex flex-col gap-3 ${
          !canCheckout
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-xl leading-none">
            {!canCheckout ? "⛔" : "⚠️"}
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-bold uppercase tracking-wider" style={serif}>
              {!canCheckout
                ? "Đơn hàng của bạn có sản phẩm không thể thanh toán!"
                : "Thông tin đơn hàng đã được cập nhật lại theo thực tế"}
            </h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {!canCheckout
                ? "Một số sản phẩm trong giỏ hàng đã bị ẩn, hết hàng hoặc ngưng bán. Vui lòng quay lại giỏ hàng để cập nhật."
                : "Giá của một số sản phẩm đã thay đổi so với thời điểm bạn thêm vào giỏ hàng."}
            </p>
          </div>
        </div>

        {/* Chi tiết từng item có issue */}
        <div className="flex flex-col gap-2 pt-2 border-t border-black/10">
          {itemsWithIssues.map((item) => {
            const isBlocking =
              item.status === CheckoutItemStatus.PRODUCT_INACTIVE ||
              item.status === CheckoutItemStatus.PRODUCT_REMOVED ||
              item.status === CheckoutItemStatus.OUT_OF_STOCK ||
              item.status === CheckoutItemStatus.INSUFFICIENT_STOCK;

            return (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-white/70 p-2.5 rounded border border-black/5 gap-2"
              >
                <div className="flex items-center gap-2.5">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                    />
                  )}
                  <div>
                    <span className="font-semibold block line-clamp-1">
                      {item.productName || "Sản phẩm không còn tồn tại"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      SL đặt: {item.quantity}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-right">
                  {item.issues.map((issue, idx) => {
                    if (issue.code === CheckoutItemStatus.PRICE_CHANGED) {
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-amber-700 font-semibold">
                          <span className="line-through text-gray-400">
                            {formatPrice(issue.oldValue ?? item.oldPrice)}
                          </span>
                          <span>➔</span>
                          <span className="text-rose-600 font-bold">
                            {formatPrice(issue.newValue ?? item.currentPrice)}
                          </span>
                        </div>
                      );
                    }

                    if (
                      issue.code === CheckoutItemStatus.PRODUCT_INACTIVE ||
                      issue.code === CheckoutItemStatus.PRODUCT_REMOVED
                    ) {
                      return (
                        <span key={idx} className="text-rose-600 font-bold">
                          Ngưng bán / Đã xóa
                        </span>
                      );
                    }

                    if (issue.code === CheckoutItemStatus.OUT_OF_STOCK) {
                      return (
                        <span key={idx} className="text-rose-600 font-bold">
                          Đã hết hàng
                        </span>
                      );
                    }

                    if (issue.code === CheckoutItemStatus.INSUFFICIENT_STOCK) {
                      return (
                        <span key={idx} className="text-amber-700 font-semibold">
                          Kho chỉ còn {issue.availableQuantity ?? item.availableQuantity} SP
                        </span>
                      );
                    }

                    return (
                      <span key={idx} className="text-rose-600">
                        {issue.message}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Button quay lại giỏ hàng nếu canCheckout === false */}
        {!canCheckout && (
          <div className="pt-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-rose-700 transition-colors uppercase tracking-wider no-underline"
              style={serif}
            >
              ← Quay về Giỏ Hàng để cập nhật
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
