"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "@/src/features/cart/hooks/useCart";
import { getSessionId } from "@/src/features/cart/services/cart.service";
import { User } from "@/src/features/auth/types/auth.types";
import type { UserLocation } from "@/src/features/location/types/location.types";
import {
  getDefaultLocation,
  getUserLocations,
} from "@/src/features/location/services/location.service";
import SelectedAddressBanner from "@/src/features/location/components/SelectedAddressBanner";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart, loading } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ─── Address state ──────────────────────────────────────────────────────────
  const [allLocations, setAllLocations] = useState<UserLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [noLocationWarning, setNoLocationWarning] = useState(false);

  // ─── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Init: load user, selected IDs, và địa chỉ đã chọn ────────────────────
  useEffect(() => {
    // Note + selected IDs từ giỏ hàng
    const savedNote = localStorage.getItem("checkout_note") || "";
    setForm((prev) => ({ ...prev, note: savedNote }));

    const savedIds = localStorage.getItem("checkout_selected_ids");
    if (savedIds) {
      try {
        const ids: string[] = JSON.parse(savedIds);
        setSelectedIds(new Set(ids));
      } catch {
        console.error("Failed to parse selected ids");
      }
    }

    // Lấy thông tin user
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      // Không có user → redirect về trang chủ (Phương án B)
      router.replace("/");
      return;
    }

    try {
      const currentUser = JSON.parse(savedUser) as User;
      setUser(currentUser);
      setForm((prev) => ({
        ...prev,
        customerName: currentUser.fullName || "",
        email: currentUser.email || "",
      }));
    } catch {
      console.error("Failed to parse user data");
      router.replace("/");
      return;
    }

    // Kiểm tra địa chỉ đã chọn từ bước /checkout/address
    const savedLoc = localStorage.getItem("checkout_selected_location");
    if (savedLoc) {
      try {
        const loc: UserLocation = JSON.parse(savedLoc);
        setSelectedLocation(loc);
        applyLocationToForm(loc);
        // Load toàn bộ địa chỉ để picker hoạt động
        setLocationLoading(true);
        getUserLocations()
          .then(setAllLocations)
          .finally(() => setLocationLoading(false));
        return;
      } catch {
        console.error("Failed to parse saved location");
      }
    }

    // Nếu chưa có địa chỉ đã chọn, fetch default từ BE
    setLocationLoading(true);
    Promise.all([getUserLocations(), getDefaultLocation()])
      .then(([all, def]) => {
        setAllLocations(all);
        if (def) {
          setSelectedLocation(def);
          applyLocationToForm(def);
          localStorage.setItem("checkout_selected_location", JSON.stringify(def));
        } else if (all.length === 0) {
          setNoLocationWarning(true);
        } else {
          // Có địa chỉ nhưng không có default → chọn cái đầu tiên
          setSelectedLocation(all[0]);
          applyLocationToForm(all[0]);
          localStorage.setItem("checkout_selected_location", JSON.stringify(all[0]));
        }
      })
      .catch(() => setNoLocationWarning(true))
      .finally(() => setLocationLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyLocationToForm(loc: UserLocation) {
    setForm((prev) => ({
      ...prev,
      customerName: loc.receiverName,
      phone: loc.phone,
      // Dùng tên (text) để gửi lên order API
      address: loc.address,
      province: loc.provinceName,
      district: loc.districtName,
      ward: loc.wardName,
    }));
  }

  const handleLocationChange = (loc: UserLocation) => {
    setSelectedLocation(loc);
    applyLocationToForm(loc);
    localStorage.setItem("checkout_selected_location", JSON.stringify(loc));
    setNoLocationWarning(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫";

  // Lọc sản phẩm theo checkbox đã chọn
  const checkoutItems = cart
    ? selectedIds.size > 0
      ? cart.items.filter((item) =>
        selectedIds.has(item.product.id || item.product._id)
      )
      : cart.items
    : [];

  const checkoutSubtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const checkoutItemCount = checkoutItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const checkoutShippingFee =
    checkoutSubtotal > 0 && checkoutSubtotal < 500000 ? 30000 : 0;
  const checkoutTotal = checkoutSubtotal + checkoutShippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || checkoutItems.length === 0) {
      setErrorMessage("Không có sản phẩm nào để đặt hàng!");
      return;
    }

    if (!selectedLocation) {
      setErrorMessage(
        "Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng!"
      );
      return;
    }

    const locationId = selectedLocation.id || selectedLocation._id;
    if (!locationId) {
      setErrorMessage("Địa chỉ giao hàng không hợp lệ, vui lòng chọn lại.");
      return;
    }

    const emailToUse = form.email || user?.email;
    if (!emailToUse) {
      setErrorMessage("Vui lòng cung cấp địa chỉ Email hợp lệ!");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const orderPayload = {
      locationId: locationId,
      email: emailToUse,
      items: checkoutItems.map((item) => ({
        productId: item.product.id || item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: checkoutTotal,
      shippingFee: checkoutShippingFee,
      sessionId: getSessionId(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(orderPayload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Tạo đơn hàng không thành công.");
      }

      const orderResult = await res.json();
      const orderData = orderResult.data || orderResult;

      // Dọn localStorage
      localStorage.removeItem("checkout_note");
      localStorage.removeItem("checkout_selected_ids");
      localStorage.removeItem("checkout_selected_location");

      await refreshCart();
      router.push(`/orders/${orderData.id || orderData._id}/success`);
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra trong quá trình đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu đang kiểm tra auth
  if (!user && typeof window !== "undefined") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Brand logo bar */}
      <div className="bg-white border-b border-[#ede0c4] py-4 text-center">
        <Link href="/">
          <img
            src="/assets/logo2.png"
            alt="Bát Tràng"
            className="h-10 md:h-12 w-auto mx-auto object-contain"
          />
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start">
        {/* Left column: Checkout form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#ede0c4] rounded p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-y-1 text-[10px] sm:text-xs text-gray-500 mb-5 font-['Cormorant_Garamond',_serif] uppercase tracking-[0.8px] sm:tracking-[1.5px]">
            <Link
              href="/cart"
              className="hover:underline text-[#8b6914] no-underline whitespace-nowrap"
            >
              Giỏ hàng
            </Link>
            <span className="mx-1.5 text-gray-400">›</span>
            <Link
              href="/checkout/address"
              className="hover:underline text-[#8b6914] no-underline whitespace-nowrap"
            >
              Địa chỉ nhận hàng
            </Link>
            <span className="mx-1.5 text-gray-400">›</span>
            <span className="text-gray-800 font-medium whitespace-nowrap">
              Thông tin giao hàng
            </span>
          </nav>

          <h2 className="text-base sm:text-xl font-bold font-['Cormorant_Garamond',_serif] tracking-[1px] sm:tracking-[1.5px] uppercase text-[#2c1a00] pb-3 border-b border-[#f3ebdb] mb-5">
            Thông tin giao hàng
          </h2>

          {/* ─── Địa chỉ nhận hàng banner ─── */}
          {locationLoading ? (
            <div className="mb-6 flex items-center gap-3 p-4 bg-[#faf8f5] border border-[#ede0c4] rounded-lg">
              <div className="w-4 h-4 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm text-gray-400">
                Đang tải địa chỉ giao hàng...
              </span>
            </div>
          ) : noLocationWarning ? (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-700 font-semibold mb-1">
                  Bạn chưa có địa chỉ nhận hàng
                </p>
                <p className="text-xs text-amber-600 mb-3">
                  Vui lòng thêm địa chỉ để tiếp tục đặt hàng.
                </p>
                <Link
                  href="/checkout/address"
                  className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded hover:bg-amber-600 transition-colors no-underline"
                >
                  Thêm địa chỉ ngay →
                </Link>
              </div>
            </div>
          ) : selectedLocation ? (
            <SelectedAddressBanner
              location={selectedLocation}
              allLocations={allLocations}
              onLocationChange={handleLocationChange}
              onLocationsUpdate={setAllLocations}
            />
          ) : null}

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded border border-red-200 mb-6">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                Họ và tên *
              </label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                readOnly={!!selectedLocation}
                className={`w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] ${selectedLocation ? "opacity-80 cursor-default" : ""
                  }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  readOnly={!!selectedLocation}
                  className={`w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] ${selectedLocation ? "opacity-80 cursor-default" : ""
                    }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Địa chỉ Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={!!user}
                  disabled={!!user}
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] disabled:opacity-80"
                />
              </div>
            </div>

            {/* Địa chỉ chi tiết */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                Địa chỉ chi tiết (Số nhà, tên đường...) *
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                readOnly={!!selectedLocation}
                className={`w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] ${selectedLocation ? "opacity-80 cursor-default" : ""
                  }`}
              />
            </div>

            {/* Tỉnh / Quận / Phường — readonly khi có địa chỉ đã chọn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["province", "district", "ward"].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                    {field === "province"
                      ? "Tỉnh / Thành phố *"
                      : field === "district"
                        ? "Quận / Huyện *"
                        : "Phường / Xã *"}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    required
                    readOnly={!!selectedLocation}
                    className={`w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] ${selectedLocation ? "opacity-80 cursor-default" : ""
                      }`}
                  />
                </div>
              ))}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                Ghi chú cho đơn hàng (tùy chọn)
              </label>
              <textarea
                placeholder="Nội dung ghi chú..."
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                className="w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] resize-none font-sans"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="mt-4 p-4 bg-[#fbfaf8] border border-[#ede0c4] rounded">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5 font-sans">
                Phương thức thanh toán
              </span>
              <div className="flex items-center justify-between p-3.5 bg-[#fffdf7] border border-[#c4a84f] rounded shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    defaultChecked
                    className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor="cod"
                    className="text-sm font-semibold text-[#2c1a00] cursor-pointer flex items-center gap-2 font-sans"
                  >
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-[#f3ebdb] pt-6">
              <Link
                href="/checkout/address"
                className="text-xs font-bold tracking-[1.5px] uppercase text-[#8b6914] no-underline hover:underline font-['Cormorant_Garamond',_serif]"
              >
                ‹ Thay đổi địa chỉ
              </Link>
              <button
                type="submit"
                disabled={submitting || !!noLocationWarning}
                className="w-full sm:w-auto bg-[#c4a84f] text-white px-8 py-3.5 hover:bg-[#a8893a] transition-colors text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] rounded disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </div>
        </form>

        {/* Right column: Order Summary */}
        <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] sticky top-6">
          <h2 className="text-base font-bold font-['Cormorant_Garamond',_serif] tracking-[1px] uppercase text-[#2c1a00] pb-3 border-b border-[#ede0c4] mb-4">
            Tóm tắt đơn hàng ({checkoutItemCount} sản phẩm)
          </h2>

          {/* Product Items */}
          <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-4 border-b border-[#ede0c4] pb-4 mb-4">
            {checkoutItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Không có sản phẩm nào được chọn.
              </p>
            ) : (
              checkoutItems.map((item) => {
                const p = item.product;
                const imageUrl =
                  p?.imageUrl?.[0] ||
                  p?.images?.[0] ||
                  "https://placehold.co/80x80";
                return (
                  <div
                    key={p.id || p._id}
                    className="flex gap-3 items-center justify-between"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 bg-[#faf7f2] border border-[#ede0c4] rounded overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#8b6914] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="max-w-[200px]">
                        <h4 className="text-xs font-semibold font-['Cormorant_Garamond',_serif] text-[#2c1a00] line-clamp-1">
                          {p.name}
                        </h4>
                        {p.sku && (
                          <span className="text-[9px] text-gray-400 tracking-wide uppercase">
                            SKU: {p.sku}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-['Cormorant_Garamond',_serif] text-xs font-bold text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-2.5 text-xs text-gray-600 font-['Cormorant_Garamond',_serif] border-b border-[#ede0c4] pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span>Tạm tính:</span>
              <span className="font-semibold text-gray-800">
                {formatPrice(checkoutSubtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Phí vận chuyển:</span>
              <span>
                {checkoutShippingFee > 0
                  ? formatPrice(checkoutShippingFee)
                  : "Miễn phí"}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-bold font-['Cormorant_Garamond',_serif] text-[#2c1a00] uppercase">
            <span>Tổng cộng:</span>
            <span className="text-lg text-[#8b2500] font-extrabold">
              {formatPrice(checkoutTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
