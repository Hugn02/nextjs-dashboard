"use client";

import React, { useState } from "react";
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

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function LocationPickerModal({
  locations,
  selectedId,
  onSelect,
  onClose,
  onLocationsChange,
}: LocationPickerModalProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedId ?? locations.find((l) => l.isDefault)?.id ?? null
  );
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<UserLocation | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const handleConfirm = () => {
    const chosen = locations.find((l) => l.id === localSelected);
    if (chosen) onSelect(chosen);
  };

  const handleDelete = async (loc: UserLocation) => {
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

  const handleSetDefault = async (loc: UserLocation) => {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede0c4] flex-shrink-0">
            <h2
              className="text-lg font-bold text-[#2c1a00] uppercase tracking-wide"
              style={serif}
            >
              Địa Chỉ Của Tôi
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-xl font-light"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Error banner */}
          {actionError && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded p-3 flex-shrink-0">
              {actionError}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {locations.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6 italic">
                Bạn chưa có địa chỉ nào.
              </p>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`flex gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                    localSelected === loc.id
                      ? "border-[#e4393c] bg-[#fff8f8]"
                      : "border-[#ede0c4] hover:border-[#c4a84f] bg-white"
                  }`}
                  onClick={() => setLocalSelected(loc.id)}
                >
                  {/* Radio */}
                  <div className="pt-0.5 flex-shrink-0">
                    <div
                      className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        localSelected === loc.id
                          ? "border-[#e4393c]"
                          : "border-gray-400"
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
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                      <span className="font-semibold text-[#2c1a00] text-sm">
                        {loc.receiverName}
                      </span>
                      <span className="text-gray-400 text-xs">|</span>
                      <span className="text-gray-600 text-sm">{loc.phone}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {loc.address}
                      <br />
                      {loc.wardName}, {loc.districtName}, {loc.provinceName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {loc.isDefault && (
                        <span className="inline-block border border-[#e4393c] text-[#e4393c] text-[10px] px-2 py-0.5 rounded font-semibold">
                          Mặc định
                        </span>
                      )}
                      <span className="inline-block bg-[#f3ebdb] text-[#8b6914] text-[10px] px-2 py-0.5 rounded">
                        {loc.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-col gap-1 flex-shrink-0 items-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditTarget(loc);
                        setShowForm(true);
                        setActionError(null);
                      }}
                      className="text-xs text-[#c4a84f] hover:text-[#a8893a] hover:underline font-semibold transition-colors"
                    >
                      Cập nhật
                    </button>
                    {!loc.isDefault && (
                      <>
                        <button
                          onClick={() => handleSetDefault(loc)}
                          disabled={settingDefault === loc._id}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-semibold transition-colors disabled:opacity-50"
                        >
                          {settingDefault === loc._id
                            ? "Đang đặt..."
                            : "Đặt mặc định"}
                        </button>
                        <button
                          onClick={() => handleDelete(loc)}
                          disabled={deleting === loc._id}
                          className="text-xs text-red-400 hover:text-red-600 hover:underline font-semibold transition-colors disabled:opacity-50"
                        >
                          {deleting === loc._id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ede0c4] flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={() => {
                setEditTarget(undefined);
                setShowForm(true);
                setActionError(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded border-2 border-dashed border-[#c4a84f] text-[#c4a84f] text-xs font-bold uppercase tracking-wider hover:bg-[#fffdf7] transition-colors"
              style={serif}
            >
              <span className="text-lg leading-none">+</span> Thêm Địa Chỉ Mới
            </button>
            <button
              onClick={handleConfirm}
              disabled={!localSelected}
              className="flex-1 py-3 rounded bg-[#e4393c] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c42d30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={serif}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>

      {/* AddressFormModal (z-50, rendered on top) */}
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
}
