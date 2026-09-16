"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { formatCloudinaryUrl, cloudinaryLoader } from "@/src/lib/cloudinary";

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const formatImageUrl = (url?: string) => formatCloudinaryUrl(url, { width: 240, quality: 80 });
const fmt = (n: number) => (n || 0).toLocaleString("vi-VN") + "₫";

export function Checkbox({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: () => void;
  id?: string;
}) {
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

function CartItemQuantityInput({
  cartId,
  quantity,
  stock,
  disabled,
  onUpdateQuantity,
  className = "w-8 text-center text-sm font-semibold text-[#2c1a00]",
}: {
  cartId: string;
  quantity: number;
  stock?: number | null;
  disabled?: boolean;
  onUpdateQuantity: (cartId: string, newQty: number) => Promise<void>;
  className?: string;
}) {
  const [val, setVal] = useState(String(quantity));

  useEffect(() => {
    setVal(String(quantity));
  }, [quantity]);

  const handleBlur = async () => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      parsed = 1;
    }
    if (stock !== undefined && stock !== null && parsed > stock) {
      parsed = stock;
      window.dispatchEvent(
        new CustomEvent("cart-warning", {
          detail: { message: `Số lượng tồn kho chỉ còn ${stock} sản phẩm.` },
        })
      );
    }
    setVal(String(parsed));
    if (parsed !== quantity) {
      await onUpdateQuantity(cartId, parsed);
    }
  };

  return (
    <input
      type="number"
      min={1}
      max={stock || 9999}
      disabled={disabled}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleBlur();
        }
      }}
      className={`${className} bg-transparent border-none outline-none focus:bg-[#faf7f2] rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  );
}

interface CartItemRowProps {
  item: any;
  isChecked: boolean;
  loading: boolean;
  updatingIds: Set<string>;
  onToggleItem: (productId: string) => void;
  onChangeQty: (cartId: string, currentQty: number, delta: number, stock?: number) => void;
  onUpdateItem: (cartId: string, newQty: number) => Promise<void>;
  onRemoveItem: (cartId: string, productId: string) => void;
}

export default function CartItemRow({
  item,
  isChecked,
  loading,
  updatingIds,
  onToggleItem,
  onChangeQty,
  onUpdateItem,
  onRemoveItem,
}: CartItemRowProps) {
  const p = item.product;
  const isDeleted = !p || (!p.id && !p._id);
  const cid = item.id;
  const pid = isDeleted ? `deleted-${cid}` : ((p.id || p._id) as string);
  const imgSrc = isDeleted ? "" : formatImageUrl(p?.imageUrl?.[0] || p?.images?.[0]);

  return (
    <div
      className={`transition-colors duration-150 ${
        isDeleted || item.isAvailable === false
          ? "bg-red-50/60 border-l-2 border-red-300"
          : isChecked
          ? "bg-[#fffdf7]"
          : "bg-white"
      }`}
    >
      {/* ── IF DELETED PRODUCT ── */}
      {isDeleted ? (
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-[80px] h-[80px] flex-shrink-0 bg-red-50/80 border border-dashed border-red-200 rounded-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">Sản phẩm không còn tồn tại</p>
            <p className="text-xs text-gray-400 mt-0.5">Sản phẩm này đã bị xóa khỏi hệ thống</p>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItem(cid, pid)}
            disabled={loading || updatingIds.has(cid)}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-300 hover:text-red-500 border border-[#e8e8e8] hover:border-red-300 rounded cursor-pointer transition-colors disabled:opacity-40"
            title="Xóa sản phẩm"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          {/* ── MOBILE LAYOUT (< sm) ── */}
          <div className="flex sm:hidden gap-3 px-4 py-4 items-start">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-[3px]">
              <Checkbox
                checked={isChecked}
                onChange={() => {
                  if (item.isAvailable === false) return;
                  onToggleItem(pid);
                }}
              />
            </div>

            {/* Product image */}
            <div className="relative w-[80px] h-[80px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm">
              <ImageWithFallback
                src={imgSrc}
                alt={p.name}
                fill
                loader={typeof imgSrc === "string" && imgSrc.includes("res.cloudinary.com") ? cloudinaryLoader : undefined}
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Right side: name + controls */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${p.slug}`}
                className="font-semibold text-[#2c1a00] hover:text-[#c4a84f] no-underline text-[13px] leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-all]"
                title={p.name}
                style={serif}
              >
                {p.name}
              </Link>
              {p.sku && (
                <span className="block text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                  SKU: {p.sku}
                </span>
              )}
              <span className="block text-[11px] text-gray-500 font-medium mt-0.5">
                Đơn giá: {fmt(item.price)}
              </span>
              {item.priceChanged && item.originalPrice && (
                <span className="block text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 w-fit font-medium">
                  Giá mới (cũ: {fmt(item.originalPrice)})
                </span>
              )}
              {item.isAvailable === false && (
                <span className="block text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded mt-1 w-fit font-medium flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {item.availabilityMessage || "Không khả dụng"}
                </span>
              )}
              {item.availabilityMessage && item.isAvailable !== false && (
                <span className="block text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1 w-fit flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {item.availabilityMessage}
                </span>
              )}

              {/* Qty + total + delete row */}
              <div className="flex items-center justify-between mt-2.5 gap-2">
                {/* Qty */}
                <div className="flex items-center border border-[#ddd] rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onChangeQty(cid, item.quantity, -1)}
                    disabled={loading || updatingIds.has(cid) || item.quantity <= 1}
                    className={`w-7 h-7 flex items-center justify-center text-[13px] text-[#2c1a00] bg-transparent border-none transition-colors ${
                      item.quantity <= 1
                        ? "opacity-30 cursor-not-allowed"
                        : loading || updatingIds.has(cid)
                        ? "cursor-default"
                        : "cursor-pointer hover:bg-[#faf7f2]"
                    }`}
                  >
                    −
                  </button>
                  <CartItemQuantityInput
                    cartId={cid}
                    quantity={item.quantity}
                    stock={p?.stock}
                    disabled={loading || updatingIds.has(cid)}
                    onUpdateQuantity={onUpdateItem}
                    className="w-8 text-center text-sm font-semibold text-[#2c1a00]"
                  />
                  <button
                    type="button"
                    onClick={() => onChangeQty(cid, item.quantity, 1, p?.stock)}
                    disabled={
                      loading ||
                      updatingIds.has(cid) ||
                      (p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock)
                    }
                    className={`w-7 h-7 flex items-center justify-center text-[13px] text-[#2c1a00] bg-transparent border-none transition-colors ${
                      p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock
                        ? "opacity-30 cursor-not-allowed"
                        : loading || updatingIds.has(cid)
                        ? "cursor-default"
                        : "cursor-pointer hover:bg-[#faf7f2]"
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <span className="text-sm font-bold text-red-600" style={serif}>
                  {fmt(item.price * item.quantity)}
                </span>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(cid, pid)}
                  disabled={loading || updatingIds.has(cid)}
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
            <Checkbox
              checked={isChecked}
              onChange={() => {
                if (item.isAvailable === false) return;
                onToggleItem(pid);
              }}
            />

            {/* Image */}
            <div className="relative w-[80px] h-[80px] flex-shrink-0 border border-[#ede0c4] bg-[#faf7f2] overflow-hidden rounded-sm">
              <ImageWithFallback
                src={imgSrc}
                alt={p.name}
                fill
                loader={typeof imgSrc === "string" && imgSrc.includes("res.cloudinary.com") ? cloudinaryLoader : undefined}
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Name + SKU + Badges */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${p.slug}`}
                className="font-semibold text-[#2c1a00] hover:text-[#c4a84f] no-underline text-sm md:text-base leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-all]"
                title={p.name}
                style={serif}
              >
                {p.name}
              </Link>
              {p.sku && (
                <span className="block text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                  SKU: {p.sku}
                </span>
              )}
              {item.priceChanged && item.originalPrice && (
                <span className="inline-block text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1 font-medium">
                  Giá đã cập nhật: {fmt(item.originalPrice)} ➔ {fmt(item.price)}
                </span>
              )}
              {item.isAvailable === false && (
                <span className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-1 font-medium">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {item.availabilityMessage || "Không thể thanh toán"}
                </span>
              )}
              {item.availabilityMessage && item.isAvailable !== false && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {item.availabilityMessage}
                </span>
              )}
            </div>

            {/* Đơn giá */}
            <div className="w-[110px] text-center shrink-0">
              <span className="text-sm font-medium text-gray-600 font-sans block">
                {fmt(item.price)}
              </span>
              {item.priceChanged && item.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through block">
                  {fmt(item.originalPrice)}
                </span>
              )}
            </div>

            {/* Qty */}
            <div className="flex items-center justify-center border border-[#ddd] rounded overflow-hidden w-[110px] shrink-0">
              <button
                type="button"
                onClick={() => onChangeQty(cid, item.quantity, -1)}
                disabled={loading || updatingIds.has(cid) || item.quantity <= 1}
                className={`w-8 h-8 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none transition-colors ${
                  item.quantity <= 1
                    ? "opacity-30 cursor-not-allowed"
                    : loading || updatingIds.has(cid)
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-[#faf7f2]"
                }`}
              >
                −
              </button>
              <CartItemQuantityInput
                cartId={cid}
                quantity={item.quantity}
                stock={p?.stock}
                disabled={loading || updatingIds.has(cid)}
                onUpdateQuantity={onUpdateItem}
                className="w-9 text-center text-sm font-semibold text-[#2c1a00]"
              />
              <button
                type="button"
                onClick={() => onChangeQty(cid, item.quantity, 1, p?.stock)}
                disabled={
                  loading ||
                  updatingIds.has(cid) ||
                  (p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock)
                }
                className={`w-8 h-8 flex items-center justify-center text-sm text-[#2c1a00] bg-transparent border-none transition-colors ${
                  p?.stock !== undefined && p?.stock !== null && item.quantity >= p.stock
                    ? "opacity-30 cursor-not-allowed"
                    : loading || updatingIds.has(cid)
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-[#faf7f2]"
                }`}
              >
                +
              </button>
            </div>

            {/* Line total */}
            <div className="w-[120px] text-right">
              <span className="text-sm font-bold text-red-600" style={serif}>
                {fmt(item.price * item.quantity)}
              </span>
            </div>

            {/* Delete */}
            <div className="w-[44px] flex justify-center">
              <button
                type="button"
                onClick={() => onRemoveItem(cid, pid)}
                disabled={loading || updatingIds.has(cid)}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 bg-transparent border border-[#e8e8e8] hover:border-red-300 rounded cursor-pointer transition-colors disabled:opacity-40"
                title="Xóa sản phẩm"
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
