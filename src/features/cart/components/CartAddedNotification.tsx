"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CartAddedEvent {
  productName: string;
}

export default function CartAddedNotification() {
  const [visible, setVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timer) clearTimeout(timer);
  }, [timer]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CartAddedEvent>).detail;
      setProductName(detail?.productName || "Sản phẩm");
      setVisible(true);

      // Auto-dismiss sau 3 giây
      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setVisible(false), 3000);
      setTimer(t);
    };

    window.addEventListener("cart-added", handler);
    return () => window.removeEventListener("cart-added", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400] bg-black/30"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        className="fixed z-[401] bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-4 text-center"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          maxWidth: "92vw",
          animation: "cartNotifIn 0.22s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Checkmark SVG */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
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
        <p className="text-sm text-gray-500 m-0">
          1 sản phẩm đã thêm vào giỏ hàng
        </p>
        <p className="text-[11px] text-gray-400 m-0 italic -mt-2">
          Thông báo sẽ tự tắt sau 3 giây...
        </p>

        <div className="flex gap-3 w-full mt-1">
          {/* Tiếp tục mua hàng */}
          <button
            onClick={dismiss}
            className="group relative flex-1 flex items-center justify-center overflow-hidden rounded-[30px] border border-[#ddd] bg-white py-3 text-[11px] font-bold uppercase tracking-[1.5px] text-gray-400 no-underline transition-colors duration-300 ease-out hover:border-[#c4a84f] hover:text-[#8b6914]"
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
            className="group relative flex-1 flex items-center justify-center overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-3 text-[11px] font-bold tracking-[1.5px] uppercase text-white no-underline transition-colors duration-300"
            style={serif}
          >
            <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[110%]" />
            <span className="relative group-hover:text-[#d29f13] transition-colors duration-300">
              Đến giỏ hàng
            </span>
          </Link>
        </div>
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
