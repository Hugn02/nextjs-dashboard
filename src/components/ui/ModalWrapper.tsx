"use client";

import { useEffect, useRef } from "react";

interface ModalWrapperProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number; // px, mặc định 480
}

export default function ModalWrapper({
  title,
  onClose,
  children,
  width = 480,
}: ModalWrapperProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài panel
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // delay nhỏ để tránh click mở đồng thời đóng ngay
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed top-[88px] md:top-[114px] inset-0 z-[199] bg-black/10 md:bg-transparent" />

      <div
        ref={panelRef}
        className="fixed top-[88px] md:top-[114px] right-0 w-full md:w-[480px] max-h-[calc(100vh-88px)] md:max-h-[calc(100vh-114px)] overflow-y-auto bg-white z-[200] shadow-[-2px_4px_24px_rgba(0,0,0,0.13)] border-l border-b border-[#eee] p-6 md:p-[36px_40px_40px] flex flex-col gap-0 animate-[dropDown_0.22s_ease]"
      >
        {title && (
          <div className="mb-1.5 text-center">
            <h2 className="text-xl font-bold font-['Cormorant_Garamond',_serif] text-[#2c1a00] tracking-[1.5px] mb-1.5 uppercase">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
