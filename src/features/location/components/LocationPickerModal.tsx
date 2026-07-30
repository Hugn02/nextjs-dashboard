"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { UserLocation, CreateUserLocationDto } from "../types/location.types";
import {
  createUserLocation,
  updateUserLocation,
  deleteUserLocation,
  setDefaultLocation,
} from "../services/location.service";
import AddressFormModal from "./AddressFormModal";

interface LocationPickerModalProps {
  locations: UserLocation[];
  selectedId: string | null;
  onSelect: (location: UserLocation) => void;
  onClose: () => void;
  onLocationsChange: (updated: UserLocation[]) => void;
}

const formatPhone = (phone?: string) => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("0")) {
    return `(+84) ${trimmed.slice(1)}`;
  }
  return trimmed;
};

export default function LocationPickerModal({
  locations,
  selectedId,
  onSelect,
  onClose,
  onLocationsChange,
}: LocationPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedId ?? locations.find((l) => l.isDefault)?.id ?? null
  );
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<UserLocation | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chosen = locations.find((l) => l.id === localSelected);
    if (chosen) onSelect(chosen);
  };

  const handleDelete = async (loc: UserLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (loc.isDefault) {
      setActionError("Không thể xóa địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước.");
      return;
    }
    if (!window.confirm(`Xóa địa chỉ "${loc.label}"?`)) return;
    setDeleting(loc.id);
    setActionError(null);
    try {
      await deleteUserLocation(loc.id);
      const updated = locations.filter((l) => l.id !== loc.id);
      onLocationsChange(updated);
      if (localSelected === loc.id) setLocalSelected(null);
    } catch (err: any) {
      setActionError(err.message || "Xóa thất bại.");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (loc: UserLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingDefault(loc.id);
    setActionError(null);
    try {
      await setDefaultLocation(loc.id);
      const updated = locations.map((l) => ({
        ...l,
        isDefault: l.id === loc.id,
      }));
      onLocationsChange(updated);
    } catch (err: any) {
      setActionError(err.message || "Cập nhật mặc định thất bại.");
    } finally {
      setSettingDefault(null);
    }
  };

  const handleFormSubmit = async (dto: CreateUserLocationDto) => {
    if (editTarget) {
      const updated = await updateUserLocation(editTarget.id, dto);
      const newList = locations.map((l) =>
        l.id === updated.id ? updated : l
      );
      onLocationsChange(newList);
    } else {
      const created = await createUserLocation(dto);
      onLocationsChange([...locations, created]);
      setLocalSelected(created.id);
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] flex items-center justify-center p-4 font-sans"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-[#ede0c4] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede0c4] flex-shrink-0 bg-[#faf8f5]">
            <h2 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider font-sans">
              Địa Chỉ Của Tôi
            </h2>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-lg font-light"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Error banner */}
          {actionError && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded p-3 flex-shrink-0 font-sans">
              {actionError}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 font-sans">
            {locations.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6 italic font-sans">
                Bạn chưa có địa chỉ nào.
              </p>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`flex gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                    localSelected === loc.id
                      ? "border-[#e4393c] bg-[#fffcfc] shadow-sm ring-1 ring-[#e4393c]/30"
                      : "border-[#ede0c4] hover:border-[#c4a84f] bg-white hover:shadow-sm"
                  }`}
                  onClick={() => setLocalSelected(loc.id)}
                >
                  {/* Radio */}
                  <div className="pt-0.5 flex-shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        localSelected === loc.id
                          ? "border-[#e4393c]"
                          : "border-gray-300"
                      }`}
                      style={{ width: 18, height: 18 }}
                    >
                      {localSelected === loc.id && (
                        <div
                          className="rounded-full bg-[#e4393c]"
                          style={{ width: 9, height: 9 }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <span className="font-bold text-[#1a1a1a] text-sm font-sans">
                        {loc.receiverName}
                      </span>
                      <span className="text-gray-300 text-xs font-sans">|</span>
                      <span className="text-gray-600 font-semibold text-xs font-sans tracking-wide">
                        {formatPhone(loc.phone)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                      {loc.address}
                      <br />
                      {loc.wardName}, {loc.districtName}, {loc.provinceName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 font-sans">
                      {loc.isDefault && (
                        <span className="inline-flex items-center border border-red-200 bg-red-50 text-[#e4393c] text-[10px] px-2 py-0.5 rounded font-semibold">
                          Mặc định
                        </span>
                      )}
                      <span className="inline-flex items-center bg-[#faf6ed] border border-[#ede0c4] text-[#8b6914] text-[10px] px-2 py-0.5 rounded font-medium">
                        {loc.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-col gap-1.5 flex-shrink-0 items-end font-sans"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(loc);
                        setShowForm(true);
                        setActionError(null);
                      }}
                      className="text-xs text-[#c4a84f] hover:text-[#a8893a] hover:underline font-medium transition-colors"
                    >
                      Cập nhật
                    </button>
                    {!loc.isDefault && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleSetDefault(loc, e)}
                          disabled={settingDefault === loc.id}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium transition-colors disabled:opacity-50"
                        >
                          {settingDefault === loc.id
                            ? "Đang đặt..."
                            : "Đặt mặc định"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(loc, e)}
                          disabled={deleting === loc.id}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition-colors disabled:opacity-50"
                        >
                          {deleting === loc.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ede0c4] flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-[#faf8f5] font-sans">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditTarget(undefined);
                setShowForm(true);
                setActionError(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded border border-dashed border-[#c4a84f] text-[#c4a84f] text-xs font-bold uppercase tracking-wider hover:bg-[#fffdf7] transition-all font-sans cursor-pointer"
            >
              <span className="text-base leading-none">+</span> Thêm Địa Chỉ Mới
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!localSelected}
              className="flex-1 py-2.5 rounded bg-[#e4393c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c42d30] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow font-sans cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>

      {/* AddressFormModal (z-[9999], rendered on top) */}
      {showForm && (
        <AddressFormModal
          editData={editTarget}
          onClose={() => {
            setShowForm(false);
            setEditTarget(undefined);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}
