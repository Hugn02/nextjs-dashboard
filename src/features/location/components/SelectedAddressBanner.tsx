"use client";

import React, { useState } from "react";
import type { UserLocation } from "../types/location.types";
import LocationPickerModal from "./LocationPickerModal";

interface SelectedAddressBannerProps {
  location: UserLocation;
  allLocations: UserLocation[];
  onLocationChange: (loc: UserLocation) => void;
  onLocationsUpdate: (locs: UserLocation[]) => void;
}

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

const formatPhone = (phone?: string) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("0")) {
    return `(+84) ${trimmed.slice(1)}`;
  }
  return trimmed;
};

export default function SelectedAddressBanner({
  location,
  allLocations,
  onLocationChange,
  onLocationsUpdate,
}: SelectedAddressBannerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div className="mb-6 bg-white border border-[#ede0c4] rounded-lg p-4 shadow-sm font-sans">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
              fill="#e4393c"
            />
          </svg>
          <span
            className="text-sm font-bold text-[#e4393c] uppercase tracking-wider font-sans"
          >
            Địa Chỉ Nhận Hàng
          </span>
        </div>

        {/* Address info + change button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
              <span className="font-bold text-[#2c1a00] text-sm font-sans">
                {location.receiverName}
              </span>
              <span className="text-gray-500 font-semibold text-xs font-sans tracking-wide">
                {formatPhone(location.phone)}
              </span>
              {location.isDefault && (
                <span className="inline-block border border-[#e4393c] text-[#e4393c] text-[10px] px-1.5 py-0.5 rounded font-semibold leading-tight">
                  Mặc Định
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {location.address}, {location.wardName}, {location.districtName},{" "}
              {location.provinceName}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex-shrink-0 text-xs font-semibold text-[#c4a84f] hover:text-[#a8893a] hover:underline transition-colors whitespace-nowrap"
          >
            Thay Đổi
          </button>
        </div>
      </div>

      {showPicker && (
        <LocationPickerModal
          locations={allLocations}
          selectedId={location.id}
          onSelect={(loc) => {
            onLocationChange(loc);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          onLocationsChange={(updated) => {
            onLocationsUpdate(updated);
            // Nếu địa chỉ đang dùng bị xóa → chọn lại default
            const stillExists = updated.find((l) => l.id === location.id);
            if (!stillExists) {
              const def = updated.find((l) => l.isDefault) ?? updated[0];
              if (def) onLocationChange(def);
            }
          }}
        />
      )}
    </>
  );
}
