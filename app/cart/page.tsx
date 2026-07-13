"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import useCart from "@/src/features/cart/hooks/useCart";

const formatImageUrl = (url?: string) => {
  if (!url) return "https://placehold.co/120x120";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://res.cloudinary.com/dls9re0ux/image/upload";
  return `${base.endsWith("/") ? base : base + "/"}${url}`;
};

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function CartPage() {
  const { cart, summary, updateItem, removeItem, loading } = useCart();
  const [note, setNote] = useState("");

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

  const changeQty = (id: string, qty: number, delta: number) => {
    const next = qty + delta;
    if (next >= 1) updateItem(id, next);
  };

  const handleSaveNote = () => {
    localStorage.setItem("checkout_note", note);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-16 px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto">

          {/* Breadcrumbs — không uppercase, chữ nhỏ bình thường */}
          <nav className="text-[13px] text-gray-400 mb-6" style={serif}>
            <Link href="/" className="hover:text-[#c4a84f] text-gray-400 no-underline transition-colors">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#2c1a00]">Giỏ hàng ({summary.itemCount})</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2c1a00] mb-8 border-b border-[#ede0c4] pb-4" style={serif}>
            Giỏ hàng của bạn
          </h1>

          {(!cart || cart.items.length === 0) ? (
            <div className="text-center py-20 bg-white border border-[#ede0c4] rounded">
              <span className="text-6xl opacity-30 block mb-4">🛒</span>
              <p className="text-gray-400 text-base mb-6" style={serif}>Chưa có sản phẩm nào trong giỏ hàng.</p>
              <Link
                href="/products/all"
                className="inline-block bg-[#c4a84f] text-white px-8 py-3 rounded text-xs font-bold tracking-[2px] uppercase no-underline hover:bg-[#a8893a] transition-colors"
                style={serif}
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

              {/* Left: Items + Note */}
              <div className="flex flex-col gap-6">
                <div className="bg-white border border-[#ede0c4] rounded shadow-sm overflow-hidden">

                  {/* Table header — desktop */}
                  <div className="hidden sm:grid grid-cols-[80px_1fr_110px_120px_44px] gap-4 px-6 py-3 bg-[#faf8f5] border-b border-[#ede0c4]">
                    <div />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Số lượng</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Thành tiền</span>
                    <div />
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#f3ebdb]">
                    {cart.items.map((item) => {
                      const p = item.product;
                      const pid = p.id || p._id;
                      const imgSrc = formatImageUrl(p?.imageUrl?.[0] || p?.images?.[0]);

                      return (
                        <div
                          key={pid}
                          className="flex flex-col sm:grid sm:grid-cols-[80px_1fr_110px_120px_44px] gap-4 px-6 py-5 items-center"
                        >
                          {/* Image */}
                          <div className="relative w-[80px] h-[80px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm mx-auto sm:mx-0">
                            <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="80px" />
                          </div>

                          {/* Name + SKU + unit price (mobile) */}
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.slug}`}
                              className="font-semibold text-[#2c1a00] hover:text-[#c4a84f] no-underline text-sm md:text-base leading-snug line-clamp-2"
                              style={serif}
                            >
                              {p.name}
                            </Link>
                            {p.sku && (
                              <span className="block text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                                SKU: {p.sku}
                              </span>
                            )}
                            <span className="block text-xs text-gray-400 mt-1">{fmt(p.price)}</span>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center justify-center border border-[#ddd] rounded overflow-hidden w-fit mx-auto">
                            <button
                              onClick={() => changeQty(pid, item.quantity, -1)}
                              disabled={loading}
                              className="w-8 h-8 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-[#2c1a00]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => changeQty(pid, item.quantity, 1)}
                              disabled={loading}
                              className="w-8 h-8 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#c4a84f]" style={serif}>
                              {fmt(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Remove button — separated cleanly on the right */}
                          <div className="flex justify-center">
                            <button
                              onClick={() => removeItem(pid)}
                              disabled={loading}
                              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 bg-transparent border border-[#e8e8e8] hover:border-red-300 rounded cursor-pointer transition-colors disabled:opacity-40"
                              title="Xóa sản phẩm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order note */}
                <div className="bg-white border border-[#ede0c4] rounded p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2c1a00] mb-3 uppercase tracking-wide" style={serif}>
                    Ghi chú đơn hàng
                  </h3>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú cho đơn hàng của bạn (ví dụ: yêu cầu giao giờ hành chính, lời nhắn viết thiệp...)"
                    className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] resize-none font-sans"
                  />
                </div>
              </div>

              {/* Right: Summary */}
              <div className="bg-white border border-[#ede0c4] rounded p-6 shadow-sm sticky top-[120px]">
                <h2 className="text-base font-bold text-[#2c1a00] uppercase tracking-wide border-b border-[#ede0c4] pb-3 mb-5" style={serif}>
                  Thông tin đơn hàng
                </h2>

                <div className="flex flex-col gap-3 text-sm border-b border-[#ede0c4] pb-4 mb-4" style={serif}>
                  <div className="flex justify-between text-gray-500">
                    <span>Tạm tính ({summary.itemCount} sản phẩm):</span>
                    <span className="font-semibold text-gray-700">{fmt(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí vận chuyển:</span>
                    <span>{summary.shippingFee > 0 ? fmt(summary.shippingFee) : "Miễn phí"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-base font-bold mb-6" style={serif}>
                  <span className="uppercase tracking-wide text-[#2c1a00]">Tổng tiền:</span>
                  <span className="text-xl text-[#c4a84f]">{fmt(summary.total)}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    onClick={handleSaveNote}
                    className="flex items-center justify-center rounded border border-[#d29f13] bg-[#d29f13] py-4 text-xs font-bold tracking-[2px] uppercase no-underline text-white transition-colors duration-200 hover:bg-white hover:text-[#2c1a00]"
                    style={serif}
                  >
                    Thanh toán đơn hàng
                  </Link>
                  <Link
                    href="/products/all"
                    className="inline-flex items-center gap-2 text-[#8b6914] hover:text-[#c4a84f] no-underline text-xs font-semibold tracking-[1px] uppercase transition-colors duration-200 pt-1 justify-center"
                    style={serif}
                  >
                    <span className="text-base">←</span>
                    Tiếp tục mua hàng
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
