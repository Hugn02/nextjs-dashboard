"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * SearchBar - Thanh tìm kiếm dùng chung đồng bộ với thiết kế toàn website Bát Tràng.
 * Thiết kế chuẩn: viền kem gốm (#ede0c4), icon kính lúp vàng kim (#c4a84f), nút xóa nhanh (X).
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
  inputClassName = "",
  size = "md",
}: SearchBarProps) {
  const pyClass = size === "sm" ? "py-1.5" : size === "lg" ? "py-3" : "py-2";

  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-[#c4a84f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-9 ${pyClass} bg-white border border-[#ede0c4] rounded-lg text-sm text-[#2c1a00] placeholder:text-gray-400 focus:outline-none focus:border-[#c4a84f] focus:ring-2 focus:ring-[#c4a84f]/20 transition-all font-sans shadow-sm ${inputClassName}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100 border-none bg-transparent flex items-center justify-center"
          title="Xóa tìm kiếm"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
