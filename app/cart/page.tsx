"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import useCart from "@/src/features/cart/hooks/useCart";

import CartItemRow, { Checkbox } from "@/src/features/cart/components/CartItemRow";
import CartOrderSummary from "@/src/features/cart/components/CartOrderSummary";
import CartEmptyState from "@/src/features/cart/components/CartEmptyState";
import CartRevalidationBanner from "@/src/features/cart/components/CartRevalidationBanner";

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    summary,
    updateItem,
    removeItem,
    loading,
    updatingIds,
    selectedIds,
    setSelectedIds,
  } = useCart();
  const [note, setNote] = useState("");
  const [loginWarning, setLoginWarning] = useState(false);

  const changeQty = (id: string, qty: number, delta: number, stock?: number) => {
    const next = qty + delta;
    if (delta > 0 && stock !== undefined && stock !== null && next > stock) {
      window.dispatchEvent(
        new CustomEvent("cart-warning", {
          detail: { message: `Số lượng tồn kho chỉ còn ${stock} sản phẩm.` },
        })
      );
      return;
    }
    if (next >= 1) updateItem(id, next);
  };

  const handleSaveNote = () => {
    localStorage.setItem("checkout_note", note);
  };

  // All product IDs in cart (skip items where product was deleted or unavailable)
  const allIds = useMemo(() => {
    if (!cart) return [] as string[];
    return cart.items
      .filter((item) => item.isAvailable !== false && item.product)
      .map((item) => item.product?.id || item.product?._id)
      .filter(Boolean) as string[];
  }, [cart]);

  const hasPriceChangesOrUnavailable = useMemo(() => {
    if (!cart) return false;
    return cart.items.some(
      (item) => item.priceChanged || item.isAvailable === false || !!item.availabilityMessage
    );
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

  // Selected items for summary (skip items that are not available)
  const selectedItems = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter(
      (item) =>
        item.product &&
        item.isAvailable !== false &&
        selectedIds.has(item.product.id || item.product._id)
    );
  }, [cart, selectedIds]);

  const selectedSummary = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = selectedItems.length;
    return { subtotal, itemCount };
  }, [selectedItems]);

  const handleCheckout = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      setLoginWarning(true);
      return;
    }
    setLoginWarning(false);
    handleSaveNote();
    localStorage.setItem("checkout_selected_ids", JSON.stringify([...selectedIds]));
    router.push("/checkout");
  };

  const handleRemoveItem = (cartId: string, productId: string) => {
    removeItem(cartId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8f5] pt-[100px] md:pt-[136px] pb-16 px-0 sm:px-4 md:px-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-0">
          {/* Breadcrumbs */}
          <nav className="text-[13px] text-gray-400 mb-6 pt-2 sm:pt-3" style={serif}>
            <Link href="/" className="hover:text-[#c4a84f] text-gray-400 no-underline transition-colors">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#2c1a00]">Giỏ hàng ({summary.itemCount})</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-[#2c1a00] mb-8 border-b border-[#ede0c4] pb-4" style={serif}>
            Giỏ hàng của bạn
          </h1>

          {/* Banner thông báo revalidation nếu có thay đổi giá hoặc tồn kho */}
          {hasPriceChangesOrUnavailable && cart && cart.items.length > 0 && (
            <CartRevalidationBanner />
          )}

          {!cart || cart.items.length === 0 ? (
            <CartEmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
              {/* Left: Items + Note */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="bg-white border-y sm:border border-[#ede0c4] sm:rounded shadow-sm overflow-hidden">
                  {/* SELECT ALL HEADER */}
                  <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-[#faf8f5] border-b border-[#ede0c4]">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={toggleAll}
                      id="select-all"
                    />
                    <label
                      htmlFor="select-all"
                      className={`text-[11px] font-semibold uppercase tracking-widest cursor-pointer select-none transition-colors ${
                        isAllSelected || isIndeterminate ? "text-[#c4a84f]" : "text-gray-400"
                      }`}
                    >
                      {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </label>

                    {/* Desktop column headers */}
                    <div className="hidden sm:grid grid-cols-[1fr_110px_110px_120px_44px] gap-4 flex-1 ml-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Đơn giá</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Số lượng</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Thành tiền</span>
                      <div />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#f3ebdb]">
                    {cart.items.map((item) => {
                      const p = item.product;
                      const isDeleted = !p || (!p.id && !p._id);
                      const cid = item.id;
                      const pid = isDeleted ? `deleted-${cid}` : ((p.id || p._id) as string);
                      const isChecked = !isDeleted && item.isAvailable !== false && selectedIds.has(pid);

                      return (
                        <CartItemRow
                          key={cid || pid}
                          item={item}
                          isChecked={isChecked}
                          loading={loading}
                          updatingIds={updatingIds}
                          onToggleItem={toggleItem}
                          onChangeQty={changeQty}
                          onUpdateItem={updateItem}
                          onRemoveItem={handleRemoveItem}
                        />
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
                    className="w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] resize-none font-sans"
                    placeholder="Nội dung ghi chú..."
                  />
                </div>
              </div>

              {/* Right: Summary */}
              <CartOrderSummary
                selectedCount={selectedIds.size}
                selectedSummary={selectedSummary}
                loginWarning={loginWarning}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
