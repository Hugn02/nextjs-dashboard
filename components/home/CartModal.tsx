"use client";

import ModalWrapper from "./ModalWrapper";

export default function CartModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper title="Giỏ hàng" onClose={onClose} width={480}>
      <p className="text-center text-sm text-[#888] mb-8 font-['Cormorant_Garamond',_serif]">
        Giỏ hàng của bạn hiện đang trống
      </p>

      {/* Icon giỏ hàng trống */}
      <div className="text-center mb-8">
        <span className="text-[56px] opacity-30">🛒</span>
      </div>

      {/* Nút tiếp tục mua sắm */}
      <a
        href="/collections"
        className="block w-full p-4 bg-[#c4a84f] text-white border-none rounded-lg cursor-pointer text-sm font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] text-center no-underline box-border transition-colors hover:bg-[#a8893a]"
      >
        Tiếp tục mua sắm
      </a>
    </ModalWrapper>
  );
}
