"use client";

import { useRef, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự focus vào input khi mở
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ModalWrapper title="Tìm kiếm sản phẩm" onClose={onClose} width={480}>
      <p className="text-center text-sm text-[#666] mb-6 font-['Cormorant_Garamond',_serif]">
        Nhập tên sản phẩm hoặc bộ sưu tập:
      </p>

      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full p-[16px_50px_16px_18px] text-[15px] border border-[#ddd] rounded-lg outline-none font-inherit box-border text-[#333] bg-white transition-colors focus:border-[#c4a84f]"
        />
        <button className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[18px] text-[#c4a84f] p-0">
          🔍
        </button>
      </div>

      <div>
        <p className="text-[12px] text-[#aaa] tracking-[1px] uppercase mb-2.5 font-sans">
          Tìm kiếm phổ biến
        </p>
        <div className="flex flex-wrap gap-2">
          {["Bộ ấm trà", "Bình hoa", "Bộ bát đĩa", "Sứ trắng", "Quà tặng"].map(
            (tag) => (
              <button
                key={tag}
                className="px-3.5 py-1.5 border border-[#e0d0b0] rounded-[20px] bg-[#fdf8ef] text-[#8b6914] text-[13px] cursor-pointer font-['Cormorant_Garamond',_serif] transition-all duration-200 hover:bg-[#c4a84f] hover:text-white hover:border-[#c4a84f]"
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = tag;
                    inputRef.current.focus();
                  }
                }}
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
