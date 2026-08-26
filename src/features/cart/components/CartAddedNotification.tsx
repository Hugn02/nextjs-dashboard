"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CartEventDetail {
  productName?: string;
  message?: string;
}

export default function CartAddedNotification() {
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "warning">("success");
  const [productName, setProductName] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timer) clearTimeout(timer);
  }, [timer]);

  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const detail = (e as CustomEvent<CartEventDetail>).detail;
      setProductName(detail?.productName || "Sản phẩm");
      setModalType("success");
      setVisible(true);

      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setVisible(false), 4000);
      setTimer(t);
    };

    const handleWarning = (e: Event) => {
      const detail = (e as CustomEvent<CartEventDetail>).detail;
      setWarningMessage(detail?.message || "Số lượng vượt quá tồn kho hiện có.");
      setModalType("warning");
      setVisible(true);

      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setVisible(false), 5000);
      setTimer(t);
    };

    window.addEventListener("cart-added", handleSuccess);
    window.addEventListener("cart-warning", handleWarning);
    return () => {
      window.removeEventListener("cart-added", handleSuccess);
      window.removeEventListener("cart-warning", handleWarning);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  if (!visible) return null;

  const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        className="fixed z-[401] bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center gap-3.5 text-center border border-[#f0e8d6]"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          maxWidth: "92vw",
          animation: "cartNotifIn 0.22s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {modalType === "success" ? (
          <>
            {/* Checkmark SVG */}
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#b2e0ae" strokeWidth="3" />
              <path
                d="M20 33l9 9 15-17"
                stroke="#5cb85c"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <h3 className="text-xl font-bold text-[#2c1a00] m-0" style={serif}>
              Cảm ơn bạn!
            </h3>
            <p className="text-sm text-gray-600 m-0 font-medium">
              Sản phẩm <span className="font-bold text-[#2c1a00]">"{productName}"</span> đã được thêm vào giỏ hàng
            </p>
            <p className="text-[11px] text-gray-400 m-0 italic -mt-1">
              Thông báo sẽ tự đóng sau 4 giây...
            </p>

            <div className="flex gap-3 w-full mt-2">
              {/* Tiếp tục mua hàng */}
              <button
                onClick={dismiss}
                className="group relative flex-1 flex items-center justify-center overflow-hidden rounded-[30px] border border-[#ddd] bg-white py-2.5 text-[11px] font-bold uppercase tracking-[1.5px] text-gray-500 no-underline transition-colors duration-300 ease-out hover:border-[#c4a84f] hover:text-[#8b6914] cursor-pointer"
                style={serif}
              >
                <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-[#eeeeee] transition-all duration-300 ease-out group-hover:w-[110%]" />
                <span className="relative transition-colors duration-300 ease-out">
                  Tiếp tục mua hàng
                </span>
              </button>

              {/* Đến giỏ hàng */}
              <Link
                href="/cart"
                onClick={dismiss}
                className="group relative flex-1 flex items-center justify-center overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-2.5 text-[11px] font-bold tracking-[1.5px] uppercase text-white no-underline transition-colors duration-300 cursor-pointer"
                style={serif}
              >
                <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[110%]" />
                <span className="relative group-hover:text-[#d29f13] transition-colors duration-300">
                  Đến giỏ hàng
                </span>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Warning SVG */}
            <div className="w-14 h-14 rounded-full bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706] mb-1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-[#78350f] m-0" style={serif}>
              Thông báo tồn kho
            </h3>
            <p className="text-sm text-[#92400e] m-0 font-medium leading-relaxed px-2">
              {warningMessage}
            </p>

            <div className="w-full mt-2">
              <button
                onClick={dismiss}
                className="group relative w-full flex items-center justify-center overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-2.5 text-[12px] font-bold tracking-[1.5px] uppercase text-white no-underline transition-colors duration-300 cursor-pointer shadow-md"
                style={serif}
              >
                <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[110%]" />
                <span className="relative group-hover:text-[#d29f13] transition-colors duration-300">
                  Đã hiểu & Đóng
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes cartNotifIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% - 16px)) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
