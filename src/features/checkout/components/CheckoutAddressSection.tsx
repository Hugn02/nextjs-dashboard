"use client";

import React from "react";
import type { UserLocation } from "@/src/features/location/types/location.types";
import SelectedAddressBanner from "@/src/features/location/components/SelectedAddressBanner";
import { User } from "@/src/features/auth/types/auth.types";

interface CheckoutAddressSectionProps {
  locationLoading: boolean;
  noLocationWarning: boolean;
  onOpenLocationPicker: () => void;
  selectedLocation: UserLocation | null;
  allLocations: UserLocation[];
  onLocationChange: (loc: UserLocation) => void;
  onLocationsUpdate: (locs: UserLocation[]) => void;
  form: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  user: User | null;
}

export default function CheckoutAddressSection({
  locationLoading,
  noLocationWarning,
  onOpenLocationPicker,
  selectedLocation,
  allLocations,
  onLocationChange,
  onLocationsUpdate,
  form,
  onChange,
  user,
}: CheckoutAddressSectionProps) {
  return (
    <div>
      {/* ─── Địa chỉ nhận hàng banner ─── */}
      {locationLoading ? (
        <div className="mb-6 flex items-center gap-3 p-4 bg-[#faf8f5] border border-[#ede0c4] rounded-lg">
          <div className="w-4 h-4 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-gray-400 font-sans">
            Đang tải địa chỉ giao hàng...
          </span>
        </div>
      ) : noLocationWarning ? (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1 font-sans">
            <p className="text-sm text-amber-700 font-semibold mb-1">
              Bạn chưa có địa chỉ nhận hàng
            </p>
            <p className="text-xs text-amber-600 mb-3">
              Vui lòng thêm địa chỉ để tiếp tục đặt hàng.
            </p>
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded hover:bg-amber-600 transition-colors cursor-pointer"
            >
              Thêm địa chỉ ngay →
            </button>
          </div>
        </div>
      ) : selectedLocation ? (
        <SelectedAddressBanner
          location={selectedLocation}
          allLocations={allLocations}
          onLocationChange={onLocationChange}
          onLocationsUpdate={onLocationsUpdate}
        />
      ) : null}

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
            onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              readOnly={!!user}
              disabled={!!user}
              className="w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] disabled:opacity-80"
            />
          </div>
        </div>

        {/* Tỉnh / Quận / Phường — readonly khi có địa chỉ đã chọn */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "province", label: "Tỉnh / Thành phố *" },
            { key: "district", label: "Quận / Huyện *" },
            { key: "ward", label: "Phường / Xã *" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans">
                {label}
              </label>
              <input
                type="text"
                name={key}
                value={form[key as keyof typeof form]}
                onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            rows={3}
            className="w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] resize-none font-sans"
          />
        </div>
      </div>
    </div>
  );
}
