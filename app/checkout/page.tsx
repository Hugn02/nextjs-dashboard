"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCart from "@/src/features/cart/hooks/useCart";
import { getSessionId } from "@/src/features/cart/services/cart.service";
import { User } from "@/src/features/auth/types/auth.types";

// Static premium administrative data
interface LocationData {
  [city: string]: {
    [district: string]: string[];
  };
}

const VIETNAM_LOCATIONS: LocationData = {
  "Hà Nội": {
    "Huyện Gia Lâm (Làng gốm Bát Tràng)": ["Xã Bát Tràng", "Xã Đa Tốn", "Xã Kiêu Kỵ", "Xã Kim Lan", "Thị trấn Trâu Quỳ"],
    "Quận Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Hàng Bạc", "Phường Hàng Trống", "Phường Hàng Bông"],
    "Quận Ba Đình": ["Phường Điện Biên", "Phường Kim Mã", "Phường Trúc Bạch", "Phường Giảng Võ"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Yên Hòa", "Phường Trung Hòa", "Phường Mai Dịch"],
  },
  "TP. Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Phạm Ngũ Lão", "Phường Tân Định"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 5", "Phường 9", "Phường 14"],
    "Quận Bình Thạnh": ["Phường 15", "Phường 19", "Phường 21", "Phường 25"],
    "TP. Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Bình An", "Phường Thủ Thiêm"],
  },
  "Đà Nẵng": {
    "Quận Hải Châu": ["Phường Thạch Thang", "Phường Thuận Phước", "Phường Hòa Thuận Đông"],
    "Quận Thanh Khê": ["Phường Vĩnh Trung", "Phường Tân Chính", "Phường Thạc Gián"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Tây", "Phường Phước Mỹ"],
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, summary, refreshCart, loading } = useCart();

  const [user, setUser] = useState<User | null>(null);
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

  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore note from Cart page
  useEffect(() => {
    const savedNote = localStorage.getItem("checkout_note") || "";
    setForm((prev) => ({ ...prev, note: savedNote }));

    // Lấy thông tin user từ localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const currentUser = JSON.parse(savedUser) as User;
        setUser(currentUser);
        // Tự động điền thông tin user vào form
        setForm((prev) => ({
          ...prev,
          customerName: currentUser.fullName || "",
          email: currentUser.email || "",
        }));
      } catch (e) { console.error("Failed to parse user data from storage"); }
    }
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (form.province && VIETNAM_LOCATIONS[form.province]) {
      const distList = Object.keys(VIETNAM_LOCATIONS[form.province]);
      setDistricts(distList);
      setForm((prev) => ({ ...prev, district: "", ward: "" }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [form.province]);

  // Update wards when district changes
  useEffect(() => {
    if (form.province && form.district && VIETNAM_LOCATIONS[form.province]?.[form.district]) {
      const wardList = VIETNAM_LOCATIONS[form.province][form.district];
      setWards(wardList);
      setForm((prev) => ({ ...prev, ward: "" }));
    } else {
      setWards([]);
    }
  }, [form.province, form.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (n: number) => {
    return n.toLocaleString("vi-VN") + "₫";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      setErrorMessage("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!form.customerName || !form.phone || !form.address || !form.province || !form.district || !form.ward) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const orderPayload = {
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      province: form.province,
      district: form.district,
      ward: form.ward,
      note: form.note,
      items: cart.items.map(item => ({
        productId: item.product.id || item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      total: summary.total,
      shippingFee: summary.shippingFee,
      sessionId: getSessionId()
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Gửi cookie xác thực cùng với request
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Tạo đơn hàng không thành công.");
      }

      const orderResult = await res.json();

      const orderData = orderResult.data || orderResult;

      // Xóa note khỏi local storage
      localStorage.removeItem("checkout_note");

      // Refresh Cart context
      await refreshCart();

      // Đi tới trang Success
      router.push(`/orders/${orderData.id || orderData._id}/success`);
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra trong quá trình đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  const citiesList = Object.keys(VIETNAM_LOCATIONS);

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
        <form onSubmit={handleSubmit} className="bg-white border border-[#ede0c4] rounded p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <nav className="text-xs text-gray-500 mb-6 font-['Cormorant_Garamond',_serif] uppercase tracking-[1.5px]">
            <Link href="/cart" className="hover:underline text-[#8b6914] no-underline">Giỏ hàng</Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-800 font-medium">Thông tin giao hàng</span>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-400">Phương thức thanh toán</span>
          </nav>

          <h2 className="text-xl font-bold font-['Cormorant_Garamond',_serif] tracking-[1.5px] uppercase text-[#2c1a00] pb-3 border-b border-[#f3ebdb] mb-6">
            Thông tin giao hàng
          </h2>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded border border-red-200 mb-6">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-4">
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
                readOnly={!!user} // Khóa trường này nếu đã đăng nhập
                disabled={!!user}
                placeholder="Nguyễn Văn A"
                className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="0901234567"
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Địa chỉ Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={!!user} // Khóa trường này nếu đã đăng nhập
                  disabled={!!user}
                  placeholder="name@example.com"
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5]"
                />
              </div>
            </div>

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
                placeholder="Số 10, ngõ 20, đường Bát Tràng"
                className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Tỉnh / Thành phố *
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5]"
                >
                  <option value="">Chọn tỉnh / thành</option>
                  {citiesList.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Quận / Huyện *
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  disabled={!form.province}
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] disabled:opacity-60"
                >
                  <option value="">Chọn quận / huyện</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                  Phường / Xã *
                </label>
                <select
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  required
                  disabled={!form.district}
                  className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] disabled:opacity-60"
                >
                  <option value="">Chọn phường / xã</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                Ghi chú cho đơn hàng (tùy chọn)
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                placeholder="Ghi chú thêm về đơn hàng..."
                className="w-full border border-[#ede0c4] rounded p-3 text-sm focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] resize-none font-sans"
              />
            </div>

            <div className="mt-4 p-4 bg-[#fbfaf8] border border-[#ede0c4] rounded">
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Phương thức thanh toán
              </span>
              <div className="flex items-center gap-3 p-3 bg-white border border-[#c4a84f] rounded">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  defaultChecked
                  className="accent-[#c4a84f] w-4 h-4"
                />
                <label htmlFor="cod" className="text-sm font-medium text-gray-800 cursor-pointer">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-[#f3ebdb] pt-6">
              <Link
                href="/cart"
                className="text-xs font-bold tracking-[1.5px] uppercase text-[#8b6914] no-underline hover:underline font-['Cormorant_Garamond',_serif]"
              >
                ‹ Quay về giỏ hàng
              </Link>
              <button
                type="submit"
                disabled={submitting}
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
            Tóm tắt đơn hàng ({summary.itemCount} sản phẩm)
          </h2>

          {/* Product Items */}
          <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-4 border-b border-[#ede0c4] pb-4 mb-4">
            {cart?.items.map((item) => {
              const p = item.product;
              const imageUrl = p?.imageUrl?.[0] || p?.images?.[0] || "https://placehold.co/80x80";
              return (
                <div key={p.id || p._id} className="flex gap-3 items-center justify-between">
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
                        <span className="text-[9px] text-gray-400 tracking-wide uppercase">SKU: {p.sku}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-['Cormorant_Garamond',_serif] text-xs font-bold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-2.5 text-xs text-gray-600 font-['Cormorant_Garamond',_serif] border-b border-[#ede0c4] pb-4 mb-4">
            <div className="flex justify-between items-center">
              <span>Tạm tính:</span>
              <span className="font-semibold text-gray-800">{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Phí vận chuyển:</span>
              <span>{summary.shippingFee > 0 ? formatPrice(summary.shippingFee) : "Miễn phí"}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-bold font-['Cormorant_Garamond',_serif] text-[#2c1a00] uppercase">
            <span>Tổng cộng:</span>
            <span className="text-lg text-[#8b2500] font-extrabold">{formatPrice(summary.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
