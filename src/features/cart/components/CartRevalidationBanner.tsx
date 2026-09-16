import React from "react";

export default function CartRevalidationBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-950 px-4 py-3.5 rounded mb-6 flex items-start gap-3 shadow-sm">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#b45309"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 mt-0.5"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex-1 text-xs sm:text-sm">
        <p className="font-bold text-amber-900">
          Thông tin giỏ hàng đã được cập nhật lại theo thực tế hệ thống:
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Giá của một số sản phẩm hoặc trạng thái khả dụng đã thay đổi. Vui lòng kiểm tra lại trước khi tiến hành thanh toán.
        </p>
      </div>
    </div>
  );
}
