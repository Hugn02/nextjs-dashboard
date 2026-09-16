"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import LocationPickerModal from "@/src/features/location/components/LocationPickerModal";
import {
  estimateCheckout,
  fetchShippingOptions,
  ShippingFeeOption,
} from "@/src/features/checkout/services/checkout.service";
import {
  CheckoutEstimateResponse,
  CheckoutItemStatus,
} from "@/src/features/checkout/types/checkout-estimate.types";
import CheckoutEstimateIssuesBanner from "@/src/features/checkout/components/CheckoutEstimateIssuesBanner";
import CheckoutAddressSection from "@/src/features/checkout/components/CheckoutAddressSection";
import CheckoutShippingCarrier from "@/src/features/checkout/components/CheckoutShippingCarrier";
import CheckoutPaymentMethod, {
  PaymentMethodType,
} from "@/src/features/checkout/components/CheckoutPaymentMethod";
import CheckoutOrderSummary from "@/src/features/checkout/components/CheckoutOrderSummary";
import { validateCoupon } from "@/src/features/coupon/services/coupon.service";
import { Coupon } from "@/src/features/coupon/types/coupon.types";
import CouponSelectorModal from "@/src/features/coupon/components/CouponSelectorModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const { cart, refreshCart } = useCart();

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

  // ─── Shipping Provider State ─────────────────────────────────────────────
  const [shippingOptions, setShippingOptions] = useState<ShippingFeeOption[]>([]);
  const [selectedShippingProvider, setSelectedShippingProvider] = useState<string>("GHN");
  const [shippingLoading, setShippingLoading] = useState(false);

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");

  // ── Init: load user, selected IDs, và địa chỉ đã chọn ────────────────────
  useEffect(() => {
    setMounted(true);
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

    const savedLoc = localStorage.getItem("checkout_selected_location");
    if (savedLoc) {
      try {
        const loc: UserLocation = JSON.parse(savedLoc);
        setSelectedLocation(loc);
        applyLocationToForm(loc);
        setLocationLoading(true);
        getUserLocations()
          .then(setAllLocations)
          .finally(() => setLocationLoading(false));
        return;
      } catch {
        console.error("Failed to parse saved location");
      }
    }

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
          setSelectedLocation(all[0]);
          applyLocationToForm(all[0]);
          localStorage.setItem("checkout_selected_location", JSON.stringify(all[0]));
        }
      })
      .catch(() => setNoLocationWarning(true))
      .finally(() => setLocationLoading(false));
  }, [authUser, router]);

  // ─── Gọi estimate (debounce 300ms) khi cart/location thay đổi ───────────
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setEstimateData(null);
      return;
    }

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

  // ─── Sync authUser → form khi store được hydrate bất đồng bộ ──────────────
  useEffect(() => {
    if (!authUser) return;
    setUser(authUser);
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || authUser.fullName || "",
      email: prev.email || authUser.email || "",
    }));
  }, [authUser]);

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

  useEffect(() => {
    let active = true;
    setShippingLoading(true);
    fetchShippingOptions({
      locationId: selectedLocation?.id || selectedLocation?._id,
      provinceName: form.province || selectedLocation?.provinceName,
      districtName: form.district || selectedLocation?.districtName,
      wardName: form.ward || selectedLocation?.wardName,
      subtotal: checkoutSubtotal,
    })
      .then((opts) => {
        if (!active) return;
        setShippingOptions(opts);
        if (opts.length > 0 && !opts.some((o) => o.providerId === selectedShippingProvider)) {
          setSelectedShippingProvider(opts[0].providerId);
        }
      })
      .catch((err) => console.error("Failed to load shipping options", err))
      .finally(() => {
        if (active) setShippingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedLocation, form.province, form.district, form.ward, checkoutSubtotal, selectedShippingProvider]);

  const activeShippingOption =
    shippingOptions.find((opt) => opt.providerId === selectedShippingProvider) ||
    shippingOptions[0] || {
      providerId: "STANDARD",
      providerName: "Giao hàng Tiêu chuẩn",
      fee: checkoutSubtotal > 0 && checkoutSubtotal < 500000 ? 30000 : 0,
      expectedDeliveryDate: "2-4 ngày làm việc",
    };

  const checkoutShippingFee = activeShippingOption.fee;
  const rawTotal = checkoutSubtotal + checkoutShippingFee;
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
        const isFreeShip = result.coupon?.discountType === "FREE_SHIPPING";
        const finalDiscount = isFreeShip ? checkoutShippingFee : result.discountAmount;
        setDiscountAmount(finalDiscount);
        if (isFreeShip) {
          setCouponSuccessMsg(`Đã áp dụng mã "${code.toUpperCase()}" (Miễn phí vận chuyển -${checkoutShippingFee.toLocaleString("vi-VN")}₫)`);
        } else {
          setCouponSuccessMsg(`Đã áp dụng mã "${code.toUpperCase()}" (-${result.discountAmount.toLocaleString("vi-VN")}₫)`);
        }
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

  useEffect(() => {
    if (appliedCoupon?.discountType === "FREE_SHIPPING") {
      setDiscountAmount(checkoutShippingFee);
    }
  }, [appliedCoupon, checkoutShippingFee]);

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
      setErrorMessage("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng!");
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
      shippingProvider: selectedShippingProvider,
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

            {/* 1. Address Section */}
            <CheckoutAddressSection
              locationLoading={locationLoading}
              noLocationWarning={noLocationWarning}
              onOpenLocationPicker={() => setShowLocationPicker(true)}
              selectedLocation={selectedLocation}
              allLocations={allLocations}
              onLocationChange={handleLocationChange}
              onLocationsUpdate={setAllLocations}
              form={form}
              onChange={handleChange}
              user={user}
            />

            {/* Estimate Issues Banner */}
            {estimateLoading && (
              <div className="my-4 flex items-center gap-2 text-xs text-gray-400 font-sans">
                <div className="w-3.5 h-3.5 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin" />
                <span>Đang kiểm tra giỏ hàng...</span>
              </div>
            )}
            {!estimateLoading && filteredEstimate && (
              <div className="my-4">
                <CheckoutEstimateIssuesBanner estimate={filteredEstimate} />
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded border border-red-200 my-4 font-sans">
                {errorMessage}
              </div>
            )}

            {/* 2. Shipping Carrier */}
            <CheckoutShippingCarrier
              shippingOptions={shippingOptions}
              selectedShippingProvider={selectedShippingProvider}
              onSelectProvider={setSelectedShippingProvider}
              shippingLoading={shippingLoading}
            />

            {/* 3. Payment Method */}
            <CheckoutPaymentMethod
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
            />

            {/* Submit button */}
            <div className="flex justify-center items-center mt-6 border-t border-[#f3ebdb] pt-6 font-sans">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !!noLocationWarning ||
                  estimateLoading ||
                  (filteredEstimate !== null && filteredEstimate.canCheckout === false)
                }
                className="w-full sm:w-auto bg-[#c4a84f] text-white px-8 py-3.5 hover:bg-[#a8893a] transition-colors text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] rounded disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? "Đang xử lý..."
                  : estimateLoading
                    ? "Đang kiểm tra..."
                    : "Đặt hàng"}
              </button>
            </div>
          </form>

          {/* Right column: Order Summary & Coupon */}
          <CheckoutOrderSummary
            checkoutItems={checkoutItems}
            checkoutItemCount={checkoutItemCount}
            checkoutSubtotal={checkoutSubtotal}
            checkoutShippingFee={checkoutShippingFee}
            discountAmount={discountAmount}
            checkoutTotal={checkoutTotal}
            appliedCoupon={appliedCoupon}
            couponCodeInput={couponCodeInput}
            validatingCoupon={validatingCoupon}
            couponError={couponError}
            couponSuccessMsg={couponSuccessMsg}
            onChangeCouponCode={setCouponCodeInput}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onOpenCouponModal={() => setShowCouponModal(true)}
          />
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

      {/* LocationPickerModal */}
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
