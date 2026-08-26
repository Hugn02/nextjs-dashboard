"use client";

import React, { useState } from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "../hooks/useCart";
import { cloudinaryLoader, formatCloudinaryUrl } from "@/src/lib/cloudinary";

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function CartModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { cart, summary, updateItem, removeItem, loading, updatingIds } = useCart();
  const [loginWarning, setLoginWarning] = useState(false);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

  const changeQty = (id: string, qty: number, delta: number) => {
    const next = qty + delta;
    if (next >= 1) updateItem(id, next);
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      setLoginWarning(true);
      return;
    }
    setLoginWarning(false);
    if (cart && cart.items && cart.items.length > 0) {
      const allIds = cart.items
        .map((item) => item.product?.id || item.product?._id)
        .filter(Boolean);
      localStorage.setItem("checkout_selected_ids", JSON.stringify(allIds));
    }
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop — đóng khi click ra ngoài */}
      <div
        className="fixed inset-0 z-[199]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Popup panel — không full height, co theo nội dung.
        Đặt fixed top-[88px] right-4 để xuất hiện ngay dưới navbar bên phải.
        max-h-[80vh] + overflow-y-auto để scroll nếu nhiều sản phẩm.
      */}
      <div
        className="fixed top-[88px] right-4 md:right-8 z-[200] bg-white border border-[#ede0c4] rounded-lg shadow-2xl w-[420px] max-w-[calc(100vw-2rem)]"
        style={{ animation: "cartPopIn 0.18s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ede0c4]">
          <h2
            className="text-sm font-bold uppercase tracking-[2px] text-[#2c1a00]"
            style={serif}
          >
            Giỏ hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#2c1a00] bg-transparent border-none cursor-pointer text-lg leading-none transition-colors"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Loading */}
        {loading && !cart && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-[3px] border-[#c4a84f] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {(!loading) && (!cart || cart.items.length === 0) && (
          <div className="flex flex-col items-center py-10 px-6 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="text-sm text-gray-400" style={serif}>
              Giỏ hàng của bạn đang trống
            </p>
            <Link
              href="/products/all"
              onClick={onClose}
              className="mt-1 px-6 py-2.5 bg-[#c4a84f] text-white text-xs font-bold tracking-[2px] uppercase rounded no-underline hover:bg-[#a8893a] transition-colors"
              style={serif}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

        {/* Items — chiều cao co theo nội dung, scroll khi > 4 sản phẩm */}
        {cart && cart.items.length > 0 && (
          <>
            <div className="overflow-y-auto max-h-[50vh] divide-y divide-[#f3ebdb] px-5">
              {cart.items.map((item) => {
                const p = item.product;
                const isDeleted = !p || (!p.id && !p._id);
                const cid = item.id; // cartId — dùng để gọi PATCH/DELETE /carts/:cartId
                const pid = isDeleted ? `deleted-${cid}` : ((p.id || p._id) as string); // productId
                const imgSrc = isDeleted ? "" : formatCloudinaryUrl(p?.imageUrl?.[0] || p?.images?.[0], { width: 144, quality: 80 });

                if (isDeleted) {
                  return (
                    <div key={cid || pid} className="flex items-center gap-3 py-3 px-1 bg-red-50/50 rounded my-1 border-l-2 border-red-300">
                      <div className="w-[50px] h-[50px] flex-shrink-0 bg-red-50 border border-dashed border-red-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-600 truncate">Sản phẩm không còn tồn tại</p>
                        <p className="text-[10px] text-gray-400">Đã bị xóa khỏi hệ thống</p>
                      </div>
                      <button
                        onClick={() => removeItem(cid)}
                        disabled={loading || updatingIds.has(cid)}
                        className="text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer text-sm leading-none transition-colors p-1"
                        title="Xóa sản phẩm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={cid} className="flex gap-3 py-4 items-start">
                    {/* Ảnh sản phẩm */}
                    <div className="relative w-[72px] h-[72px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm">
                      <ImageWithFallback
                        src={imgSrc}
                        alt={p.name}
                        fill
                        loader={typeof imgSrc === "string" && imgSrc.includes("res.cloudinary.com") ? cloudinaryLoader : undefined}
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={onClose}
                          className="text-sm font-semibold text-[#2c1a00] hover:text-[#c4a84f] no-underline line-clamp-2 leading-snug"
                          style={serif}
                        >
                          {p.name}
                        </Link>
                        {/* Nút xóa — góc trên phải, tách rõ */}
                        <button
                          onClick={() => removeItem(cid)}
                          disabled={loading || updatingIds.has(cid)}
                          className="flex-shrink-0 text-gray-300 hover:text-red-500 bg-transparent border-none cursor-pointer text-base leading-none transition-colors disabled:opacity-40 pt-0.5"
                          title="Xóa sản phẩm"
                        >
                          ✕
                        </button>
                      </div>

                      {p.sku && (
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-0.5">
                          SKU: {p.sku}
                        </span>
                      )}

                      {/* Qty controls + giá — cùng hàng */}
                      <div className="flex items-end justify-between mt-2.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center border border-[#ddd] rounded overflow-hidden w-fit">
                            <button
                              onClick={() => changeQty(cid, item.quantity, -1)}
                              disabled={loading || updatingIds.has(cid) || item.quantity <= 1}
                              className={`w-7 h-7 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none transition-colors ${
                                item.quantity <= 1
                                  ? 'opacity-30 cursor-not-allowed'
                                  : (loading || updatingIds.has(cid))
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:bg-[#faf7f2]'
                              }`}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-[#2c1a00]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => changeQty(cid, item.quantity, 1)}
                              disabled={loading || updatingIds.has(cid) || (p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock)}
                              className={`w-7 h-7 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none transition-colors ${
                                p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock
                                  ? 'opacity-30 cursor-not-allowed'
                                  : (loading || updatingIds.has(cid))
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:bg-[#faf7f2]'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {fmt(item.price)}
                          </span>
                          {item.priceChanged && item.originalPrice && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded block w-fit mt-0.5 font-medium">
                              Giá mới (cũ: {fmt(item.originalPrice)})
                            </span>
                          )}
                          {item.isAvailable === false && (
                            <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 w-fit mt-0.5 font-medium">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              <span>{item.availabilityMessage || "Không khả dụng"}</span>
                            </span>
                          )}
                          {item.availabilityMessage && item.isAvailable !== false && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded block w-fit mt-0.5">
                              {item.availabilityMessage}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-red-600 block" style={serif}>
                            {fmt(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer — luôn ở dưới cùng popup */}
            <div className="border-t border-[#ede0c4] px-5 py-4 flex flex-col gap-3">
              <div className="flex justify-between items-center" style={serif}>
                <span className="text-sm font-bold uppercase tracking-wider text-[#2c1a00]">
                  Tổng tiền:
                </span>
                <span className="text-base font-bold text-red-600">
                  {fmt(summary.subtotal)}
                </span>
              </div>

              <p
                className={`text-[11px] italic -mt-1 ${summary.shippingFee > 0 ? "text-gray-400" : "text-green-600 font-semibold"
                  }`}
              >
                {summary.shippingFee > 0
                  ? `* Phí vận chuyển: ${fmt(summary.shippingFee)}`
                  : "* Miễn phí vận chuyển cho đơn hàng của bạn!"}
              </p>

              {/* Banner cảnh báo chưa đăng nhập */}
              {loginWarning && (
                <div className="flex flex-col gap-2 bg-amber-50 border border-amber-300 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-start gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <p className="text-xs text-amber-800 font-semibold leading-relaxed" style={serif}>
                      Bạn cần <strong>đăng nhập</strong> để tiến hành thanh toán!
                    </p>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-login-modal"))}
                    className="w-full py-2 rounded bg-[#c4a84f] text-white text-xs font-bold tracking-[1.5px] uppercase hover:bg-[#a8893a] transition-colors border-none cursor-pointer"
                    style={serif}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 mt-0.5">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="group relative flex items-center justify-center overflow-hidden rounded-[30px] border border-[#d29f13] bg-white py-3 text-xs font-bold tracking-[1.5px] uppercase no-underline text-[#d29f13] transition-colors duration-300 ease-out"
                  style={serif}
                >
                  <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-[#d29f13] transition-all duration-300 ease-out group-hover:w-[105%]" />
                  <span className="relative transition-colors duration-300 ease-out group-hover:text-white">Xem giỏ hàng</span>
                </Link>
                <button
                  onClick={handleCheckout}
                  className="group relative flex items-center justify-center overflow-hidden rounded-[30px] border border-[#d29f13] bg-[#d29f13] py-3 text-xs font-bold tracking-[1.5px] uppercase text-white transition-colors duration-300 ease-out cursor-pointer"
                  style={serif}
                >
                  <span className="absolute top-0 left-1/2 h-full w-0 -translate-x-1/2 bg-white transition-all duration-300 ease-out group-hover:w-[105%]" />
                  <span className="relative transition-colors duration-300 ease-out group-hover:text-[#d29f13]">Thanh toán</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes cartPopIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1);    }
        }
      `}</style>
    </>
  );
}
