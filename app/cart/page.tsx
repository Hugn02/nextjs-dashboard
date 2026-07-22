"use client";

import React, { useState, useMemo } from "react";
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

// Custom Checkbox component
function Checkbox({ checked, onChange, id }: { checked: boolean; onChange: () => void; id?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c4a84f] focus:ring-offset-1 ${
        checked ? "bg-[#c4a84f] border-[#c4a84f]" : "bg-white border-[#d1c0a2] hover:border-[#c4a84f]"
      }`}
    >
      {checked && (
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export default function CartPage() {
  const { cart, summary, updateItem, removeItem, loading } = useCart();
  const [note, setNote] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

  const changeQty = (id: string, qty: number, delta: number) => {
    const next = qty + delta;
    if (next >= 1) updateItem(id, next);
  };

  const handleSaveNote = () => {
    localStorage.setItem("checkout_note", note);
  };

  // All product IDs in cart
  const allIds = useMemo(() => {
    if (!cart) return [] as string[];
    return cart.items.map((item) => item.product.id || item.product._id) as string[];
  }, [cart]);

  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const isIndeterminate = !isAllSelected && allIds.some((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Selected items for summary
  const selectedItems = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter((item) => selectedIds.has(item.product.id || item.product._id));
  }, [cart, selectedIds]);

  const selectedSummary = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = subtotal > 0 && subtotal < 500000 ? 30000 : 0;
    return { subtotal, itemCount, total: subtotal + shippingFee, shippingFee };
  }, [selectedItems]);

  const handleCheckout = () => {
    handleSaveNote();
    localStorage.setItem("checkout_selected_ids", JSON.stringify([...selectedIds]));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-16 px-0 sm:px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-0">

          {/* Breadcrumbs */}
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
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="bg-white border-y sm:border border-[#ede0c4] sm:rounded shadow-sm overflow-hidden">

                  {/* ── SELECT ALL HEADER ── */}
                  <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-[#faf8f5] border-b border-[#ede0c4]">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={toggleAll}
                      id="select-all"
                    />
                    <label
                      htmlFor="select-all"
                      className={`text-[11px] font-semibold uppercase tracking-widest cursor-pointer select-none transition-colors ${isAllSelected || isIndeterminate ? "text-[#c4a84f]" : "text-gray-400"
                        }`}
                    >
                      {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </label>

                    {/* Desktop column headers */}
                    <div className="hidden sm:grid grid-cols-[1fr_110px_120px_44px] gap-4 flex-1 ml-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Số lượng</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Thành tiền</span>
                      <div />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#f3ebdb]">
                    {cart.items.map((item) => {
                      const p = item.product;
                      const pid = (p.id || p._id) as string;
                      const imgSrc = formatImageUrl(p?.imageUrl?.[0] || p?.images?.[0]);
                      const isChecked = selectedIds.has(pid);

                      return (
                        <div
                          key={pid}
                          className={`transition-colors duration-150 ${isChecked ? "bg-[#fffdf7]" : "bg-white"}`}
                        >
                          {/* ── MOBILE LAYOUT (< sm) ── */}
                          <div className="flex sm:hidden gap-3 px-4 py-4 items-start">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-[3px]">
                              <Checkbox checked={isChecked} onChange={() => toggleItem(pid)} />
                            </div>

                            {/* Product image */}
                            <div className="relative w-[80px] h-[80px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm">
                              <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="80px" />
                            </div>

                            {/* Right side: name + controls */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${p.slug}`}
                                className="font-semibold text-[#2c1a00] hover:text-[#c4a84f] no-underline text-[13px] leading-snug line-clamp-2"
                                style={serif}
                              >
                                {p.name}
                              </Link>
                              {p.sku && (
                                <span className="block text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                                  SKU: {p.sku}
                                </span>
                              )}
                              <span className="block text-[11px] text-gray-400 mt-0.5">{fmt(p.price)}</span>

                              {/* Qty + total + delete row */}
                              <div className="flex items-center justify-between mt-2.5 gap-2">
                                {/* Qty */}
                                <div className="flex items-center border border-[#ddd] rounded overflow-hidden">
                                  <button
                                    onClick={() => changeQty(pid, item.quantity, -1)}
                                    disabled={loading}
                                    className="w-7 h-7 flex items-center justify-center text-[13px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] disabled:opacity-40"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold text-[#2c1a00]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => changeQty(pid, item.quantity, 1)}
                                    disabled={loading}
                                    className="w-7 h-7 flex items-center justify-center text-[13px] text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] disabled:opacity-40"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Line total */}
                                <span className="text-sm font-bold text-[#c4a84f]" style={serif}>
                                  {fmt(item.price * item.quantity)}
                                </span>

                                {/* Delete */}
                                <button
                                  onClick={() => removeItem(pid)}
                                  disabled={loading}
                                  className="w-7 h-7 flex items-center justify-center text-[10px] text-gray-300 hover:text-red-500 border border-[#e8e8e8] hover:border-red-300 rounded cursor-pointer transition-colors disabled:opacity-40"
                                  title="Xóa sản phẩm"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* ── DESKTOP LAYOUT (≥ sm) ── */}
                          <div className="hidden sm:flex items-center gap-4 px-6 py-5">
                            {/* Checkbox */}
                            <Checkbox checked={isChecked} onChange={() => toggleItem(pid)} />

                            {/* Image */}
                            <div className="relative w-[80px] h-[80px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm">
                              <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="80px" />
                            </div>

                            {/* Name + SKU + unit price */}
                            <div className="flex-1 min-w-0">
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

                            {/* Qty */}
                            <div className="flex items-center justify-center border border-[#ddd] rounded overflow-hidden w-fit">
                              <button
                                onClick={() => changeQty(pid, item.quantity, -1)}
                                disabled={loading}
                                className="w-8 h-8 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none cursor-pointer hover:bg-[#faf7f2] disabled:opacity-40"
                              >
                                −
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
                            <div className="w-[120px] text-right">
                              <span className="text-sm font-bold text-[#c4a84f]" style={serif}>
                                {fmt(item.price * item.quantity)}
                              </span>
                            </div>

                            {/* Delete */}
                            <div className="w-[44px] flex justify-center">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order note */}
                <div className="bg-white border-y sm:border border-[#ede0c4] sm:rounded p-4 sm:p-5 shadow-sm">
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
              <div className="bg-white border border-[#ede0c4] rounded p-6 shadow-sm sticky top-[120px] mx-4 sm:mx-0">
                <h2 className="text-base font-bold text-[#2c1a00] uppercase tracking-wide border-b border-[#ede0c4] pb-3 mb-5" style={serif}>
                  Thông tin đơn hàng
                </h2>

                {selectedIds.size === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3 italic" style={serif}>
                    Vui lòng chọn sản phẩm để thanh toán.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 text-sm border-b border-[#ede0c4] pb-4 mb-4" style={serif}>
                    <div className="flex justify-between text-gray-500">
                      <span>Đã chọn ({selectedSummary.itemCount} sản phẩm):</span>
                      <span className="font-semibold text-gray-700">{fmt(selectedSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Phí vận chuyển:</span>
                      <span>{selectedSummary.shippingFee > 0 ? fmt(selectedSummary.shippingFee) : "Miễn phí"}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-base font-bold mb-6" style={serif}>
                  <span className="uppercase tracking-wide text-[#2c1a00]">Tổng tiền:</span>
                  <span className="text-xl text-[#c4a84f]">
                    {selectedIds.size > 0 ? fmt(selectedSummary.total) : "0₫"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {selectedIds.size > 0 ? (
                    <Link
                      href="/checkout"
                      onClick={handleCheckout}
                      className="flex items-center justify-center rounded border border-[#d29f13] bg-[#d29f13] py-4 text-xs font-bold tracking-[2px] uppercase no-underline text-white transition-colors duration-200 hover:bg-white hover:text-[#2c1a00]"
                      style={serif}
                    >
                      Thanh toán ({selectedIds.size} sản phẩm)
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center rounded border border-[#ddd] bg-[#f0ebe0] py-4 text-xs font-bold tracking-[2px] uppercase text-[#bbb] cursor-not-allowed"
                      style={serif}
                    >
                      Chọn sản phẩm để thanh toán
                    </button>
                  )}
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
