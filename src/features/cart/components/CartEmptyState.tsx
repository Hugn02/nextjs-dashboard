import React from "react";
import Link from "next/link";

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function CartEmptyState() {
  return (
    <div className="text-center py-20 bg-white border border-[#ede0c4] rounded">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c4a84f"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto mb-4 opacity-30"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <p className="text-gray-400 text-base mb-6" style={serif}>
        Chưa có sản phẩm nào trong giỏ hàng.
      </p>
      <Link
        href="/products/all"
        className="inline-block bg-[#c4a84f] text-white px-8 py-3 rounded text-xs font-bold tracking-[2px] uppercase no-underline hover:bg-[#a8893a] transition-colors"
        style={serif}
      >
        Tiếp tục mua hàng
      </Link>
    </div>
  );
}
