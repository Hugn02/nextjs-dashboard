"use client";

import React from "react";

interface Badge {
  icon: React.ReactNode;
  text: string;
}

const TRUST_BADGES: Badge[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    text: "Thương hiệu sứ cao cấp danh tiếng Bát Tràng",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    text: "Hỗ trợ gói quà miễn phí",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    text: "Bảo hành bể vỡ khi vận chuyển",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    text: "Giao hàng toàn quốc",
  },
];

export default function TrustBar() {
  return (
    <div className="hidden md:block bg-[#fdf8ef] border-y border-[#e8d9bb] overflow-hidden">
      <div className="flex whitespace-nowrap animate-[marquee_18s_linear_infinite]">
        {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-10 py-3 text-[13px] text-[#5a3e00] font-['Cormorant_Garamond',_serif] tracking-[0.5px] border-r border-[#e8d9bb]"
          >
            {b.icon}
            {b.text}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
