"use client";

import React, { useState, useEffect, useMemo } from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "@/src/features/cart/hooks/useCart";
import { User } from "@/src/features/auth/types/auth.types";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import type { UserLocation } from "@/src/features/location/types/location.types";
import {
  getDefaultLocation,
  getUserLocations,
} from "@/src/features/location/services/location.service";
import SelectedAddressBanner from "@/src/features/location/components/SelectedAddressBanner";
import LocationPickerModal from "@/src/features/location/components/LocationPickerModal";
import { estimateCheckout } from "@/src/features/checkout/services/checkout.service";
import {
  CheckoutEstimateResponse,
  CheckoutItemStatus,
} from "@/src/features/checkout/types/checkout-estimate.types";
import CheckoutEstimateIssuesBanner from "@/src/features/checkout/components/CheckoutEstimateIssuesBanner";
import { validateCoupon } from "@/src/features/coupon/services/coupon.service";
import { Coupon } from "@/src/features/coupon/types/coupon.types";
import CouponSelectorModal from "@/src/features/coupon/components/CouponSelectorModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { user: authUser, token } = useAuthStore();
  const { cart, refreshCart, loading } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // ─── Coupon State ──────────────────────────────────────────────────────────
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // ─── Estimate State ────────────────────────────────────────────────────────
  const [estimateData, setEstimateData] = useState<CheckoutEstimateResponse | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  // ─── Address state ──────────────────────────────────────────────────────────
  const [allLocations, setAllLocations] = useState<UserLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [noLocationWarning, setNoLocationWarning] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay" | "momo">("cod");

  // ── Init: load user, selected IDs, và địa chỉ đã chọn ────────────────────
  useEffect(() => {
    setMounted(true);
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

    // Kiểm tra token xác thực
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!savedToken) {
      router.replace("/");
      return;
    }

    if (authUser) {
      setUser(authUser);
      setForm((prev) => ({
        ...prev,
        customerName: authUser.fullName || "",
        email: authUser.email || "",
      }));
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

  // ─── Gọi estimate (debounce 300ms) khi cart/location thay đổi ───────────
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setEstimateData(null);
      return;
    }

    // Debounce: nếu cart và selectedLocation thay đổi liên tiếp trong cùng
    // 300ms (ví dụ khi mount), chỉ gọi API 1 lần duy nhất.
    const timer = setTimeout(() => {
      let cancelled = false;
      setEstimateLoading(true);
      const addressId =
        selectedLocation?.id || selectedLocation?._id || undefined;
      estimateCheckout({ addressId })
        .then((data) => {
          if (!cancelled) setEstimateData(data);
        })
        .catch((err) => {
          console.error("Estimate error:", err);
        })
        .finally(() => {
          if (!cancelled) setEstimateLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, 300);

    return () => clearTimeout(timer);
  }, [cart, selectedLocation]);

  // Tự động kiểm tra & đồng bộ selectedIds với sản phẩm hiện có trong cart
  useEffect(() => {
    if (!cart || cart.items.length === 0) return;

    const cartProductIds = cart.items
      .map((item) => item.product?.id || item.product?._id)
      .filter(Boolean) as string[];

    setSelectedIds((prev) => {
      if (prev.size === 0) {
        return new Set(cartProductIds);
      }
      const validSelected = new Set([...prev].filter((id) => cartProductIds.includes(id)));
      return validSelected.size > 0 ? validSelected : new Set(cartProductIds);
    });
  }, [cart]);


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

  // Lọc estimateData chỉ áp dụng cho các sản phẩm được chọn (selectedIds)
  const filteredEstimate = useMemo(() => {
    if (!estimateData) return null;
    if (selectedIds.size === 0) return estimateData;

    const filteredItems = estimateData.items.filter((item) =>
      selectedIds.has(item.productId)
    );

    const blockingStatuses = new Set([
      CheckoutItemStatus.PRODUCT_REMOVED,
      CheckoutItemStatus.PRODUCT_INACTIVE,
      CheckoutItemStatus.OUT_OF_STOCK,
      CheckoutItemStatus.INSUFFICIENT_STOCK,
      CheckoutItemStatus.VARIANT_UNAVAILABLE,
    ]);

    const canCheckout = filteredItems.every(
      (item) => !blockingStatuses.has(item.status)
    );

    const subtotal = filteredItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    const shippingFee = subtotal > 0 && subtotal < 500000 ? 30000 : 0;
    const total = subtotal + shippingFee;

    return {
      ...estimateData,
      canCheckout,
      items: filteredItems,
      pricing: {
        ...estimateData.pricing,
        subtotal,
        shippingFee,
        total,
      },
    };
  }, [estimateData, selectedIds]);

  // Lọc sản phẩm theo checkbox đã chọn
  const checkoutItems = cart
    ? selectedIds.size > 0
      ? cart.items.filter((item) =>
        selectedIds.has(item.product?.id || item.product?._id)
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
  // Ưu tiên giá từ estimate API (đã lọc theo selectedIds) nếu có, fallback về tính tay
  const checkoutShippingFee =
    filteredEstimate?.pricing?.shippingFee ??
    (checkoutSubtotal > 0 && checkoutSubtotal < 500000 ? 30000 : 0);
  const rawTotal =
    filteredEstimate?.pricing?.total ?? checkoutSubtotal + checkoutShippingFee;
  const checkoutTotal = Math.max(0, rawTotal - discountAmount);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }
    setValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    try {
      const result = await validateCoupon(code, checkoutSubtotal);
      if (!result.valid) {
        setCouponError(result.message || "Mã giảm giá không hợp lệ hoặc không áp dụng được cho đơn hàng này.");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        setAppliedCoupon(result.coupon || null);
        setDiscountAmount(result.discountAmount);
        setCouponSuccessMsg(`Đã áp dụng mã "${code.toUpperCase()}" (-${result.discountAmount.toLocaleString("vi-VN")}₫)`);
        setCouponCodeInput(code.toUpperCase());
      }
    } catch (err: any) {
      setCouponError(err.message || "Không thể kiểm tra mã giảm giá. Vui lòng thử lại.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput("");
    setCouponError(null);
    setCouponSuccessMsg(null);
  };

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
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code || (couponCodeInput.trim() ? couponCodeInput.trim().toUpperCase() : undefined),
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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

      if (paymentMethod !== "cod") {
        try {
          const payRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/payments/create-url`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              credentials: "include",
              body: JSON.stringify({
                orderId: orderData.id || orderData._id || orderData.publicId,
                paymentMethod: paymentMethod,
              }),
            }
          );

          if (payRes.ok) {
            const payData = await payRes.json();
            const payResult = payData.data || payData;
            if (payResult?.paymentUrl) {
              window.location.href = payResult.paymentUrl;
              return;
            }
          }
        } catch (payErr) {
          console.error("Error creating payment URL:", payErr);
        }
      }

      router.push(`/orders/${orderData.id || orderData._id}/success`);
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra trong quá trình đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  // Chưa mount (SSR) → không render gì → tránh hydration mismatch
  if (!mounted) return null;

  return (
    <>
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
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded hover:bg-amber-600 transition-colors"
                  >
                    Thêm địa chỉ ngay →
                  </button>
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

            {/* ─── Estimate Issues Banner ─── */}
            {estimateLoading && (
              <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3.5 h-3.5 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin" />
                <span>Đang kiểm tra giỏ hàng...</span>
              </div>
            )}
            {!estimateLoading && filteredEstimate && (
              <CheckoutEstimateIssuesBanner estimate={filteredEstimate} />
            )}

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
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 font-sans">
                  Phương thức thanh toán
                </span>
                <div className="flex flex-col gap-3">
                  {/* COD */}
                  <label
                    htmlFor="cod"
                    className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${paymentMethod === "cod"
                      ? "bg-[#fffdf7] border-[#c4a84f]"
                      : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="3" />
                          <path d="M6 12h.01M18 12h.01" />
                        </svg>
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </span>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label
                    htmlFor="vnpay"
                    className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${paymentMethod === "vnpay"
                      ? "bg-[#fffdf7] border-[#c4a84f]"
                      : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="vnpay"
                        name="paymentMethod"
                        value="vnpay"
                        checked={paymentMethod === "vnpay"}
                        onChange={() => setPaymentMethod("vnpay")}
                        className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <span>Thanh toán qua VNPay (Thẻ ATM / QR Code / Visa)</span>
                      </span>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label
                    htmlFor="momo"
                    className={`flex items-center justify-between p-3.5 border rounded shadow-sm cursor-pointer transition-all ${paymentMethod === "momo"
                      ? "bg-[#fffdf7] border-[#c4a84f]"
                      : "bg-white border-[#ede0c4] hover:border-[#c4a84f]/60"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="momo"
                        name="paymentMethod"
                        value="momo"
                        checked={paymentMethod === "momo"}
                        onChange={() => setPaymentMethod("momo")}
                        className="accent-[#c4a84f] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-[#2c1a00] font-sans flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                          <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                        <span>Thanh toán qua Ví MoMo (App MoMo / MoMo QR Code)</span>
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center items-center mt-6 border-t border-[#f3ebdb] pt-6">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !!noLocationWarning ||
                    estimateLoading ||
                    (filteredEstimate !== null && filteredEstimate.canCheckout === false)
                  }
                  className="w-full sm:w-auto bg-[#c4a84f] text-white px-8 py-3.5 hover:bg-[#a8893a] transition-colors text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] rounded disabled:opacity-50"
                >
                  {submitting
                    ? "Đang xử lý..."
                    : estimateLoading
                      ? "Đang kiểm tra..."
                      : "Đặt hàng"}
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
            <div className="max-h-[300px] overflow-y-auto pt-2 pb-4 pr-1 flex flex-col gap-4 border-b border-[#ede0c4] mb-4">
              {checkoutItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  Không có sản phẩm nào được chọn.
                </p>
              ) : (
                checkoutItems.map((item, idx) => {
                  const p = item.product;
                  const isDeleted = !p || (!p.id && !p._id);
                  const pid = isDeleted ? `deleted-${idx}` : (p.id || p._id);
                  const imageUrl = !isDeleted
                    ? p?.imageUrl?.[0] || p?.images?.[0] || "https://placehold.co/80x80"
                    : "";

                  if (isDeleted) {
                    return (
                      <div
                        key={pid}
                        className="flex gap-3 items-center justify-between p-2 rounded bg-red-50/60 border border-red-200"
                      >
                        <div className="flex gap-3 items-center min-w-0 flex-1">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <div className="w-full h-full bg-red-100/70 border border-red-200 rounded flex items-center justify-center overflow-hidden">
                              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </div>
                            <span className="absolute -top-1.5 -right-1.5 z-10 bg-red-600 text-white text-[9px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-red-600 line-clamp-1">
                              Sản phẩm không còn tồn tại
                            </h4>
                            <span className="text-[10px] text-red-400 block font-sans">
                              Đã bị xóa khỏi hệ thống
                            </span>
                          </div>
                        </div>
                        <span className="font-['Cormorant_Garamond',_serif] text-xs font-bold text-red-400 line-through flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={pid}
                      className="flex gap-3 items-center justify-between"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <div className="w-full h-full bg-[#faf7f2] border border-[#ede0c4] rounded overflow-hidden relative">
                            <ImageWithFallback
                              src={imageUrl}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 z-10 bg-[#8b6914] text-white text-[9px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm">
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

            {/* Coupon Section */}
            <div className="border-b border-[#ede0c4] pb-4 mb-4 font-['Cormorant_Garamond',_serif]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 font-sans flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span>Mã giảm giá / Voucher</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(true)}
                  className="text-xs font-bold text-[#8b6914] hover:underline font-sans"
                >
                  Chọn voucher →
                </button>
              </div>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="MÃ GIẢM GIÁ"
                    className="flex-1 border border-[#ede0c4] rounded px-3 py-2 text-xs font-mono uppercase bg-[#faf8f5] focus:outline-none focus:border-[#c4a84f]"
                  />
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponCodeInput.trim()}
                    onClick={() => handleApplyCoupon()}
                    className="bg-[#c4a84f] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#a8893a] transition-colors disabled:opacity-50 uppercase tracking-wider"
                  >
                    {validatingCoupon ? "..." : "Áp dụng"}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 font-sans">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 font-sans">
                      {appliedCoupon.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-500 hover:text-red-700 font-sans p-1"
                    title="Bỏ sử dụng mã"
                  >
                    ✕
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 mt-1.5 font-sans flex items-start gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccessMsg && !couponError && (
                <p className="text-[11px] text-emerald-600 mt-1.5 font-sans flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{couponSuccessMsg}</span>
                </p>
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
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span>Giảm giá (Voucher):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
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

      {/* CouponSelectorModal */}
      {showCouponModal && (
        <CouponSelectorModal
          subtotal={checkoutSubtotal}
          selectedCode={appliedCoupon?.code || null}
          onSelect={(coupon) => {
            setAppliedCoupon(coupon);
            setCouponCodeInput(coupon.code);
            handleApplyCoupon(coupon.code);
          }}
          onClose={() => setShowCouponModal(false)}
        />
      )}

      {/* LocationPickerModal - dùng khi chưa có địa chỉ */}
      {showLocationPicker && (
        <LocationPickerModal
          locations={allLocations}
          selectedId={selectedLocation?.id ?? null}
          onSelect={(loc) => {
            handleLocationChange(loc);
            setNoLocationWarning(false);
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
          onLocationsChange={(updated) => {
            setAllLocations(updated);
            const def = updated.find((l) => l.isDefault) ?? updated[0];
            if (def) {
              handleLocationChange(def);
              setNoLocationWarning(false);
            }
          }}
        />
      )}
    </>
  );
}
