'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Storefront Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#faf7f2]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#e8dfd3] p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#fcedd8] flex items-center justify-center text-[#c28d47]">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif font-bold text-[#3e2714] mb-2">
          Kết nối tạm thời bị gián đoạn
        </h2>

        {/* Description */}
        <p className="text-sm text-[#735b46] leading-relaxed mb-6">
          Hệ thống gặp sự cố ngoài dự kiến trong khi tải nội dung. Xin bạn vui lòng thử lại hoặc quay lại trang chủ.
        </p>

        {/* Technical Detail for Debugging */}
        {error?.message && (
          <div className="mb-6 p-3 bg-[#f5efe6] rounded-lg text-left">
            <p className="text-xs text-[#8a725c] font-mono break-all line-clamp-2">
              Chi tiết: {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#c28d47] hover:bg-[#a87433] text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow"
          >
            Thử lại ngay
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#f5efe6] text-[#5c3e21] border border-[#d6c7b2] font-medium text-sm transition-all duration-200"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
