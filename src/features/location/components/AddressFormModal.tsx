"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getProvinces, getDistricts, getWards } from "../services/location.service";
import type {
  Province,
  District,
  Ward,
  UserLocation,
  CreateUserLocationDto,
} from "../types/location.types";

interface AddressFormModalProps {
  /** Nếu truyền `editData` → mode Update, không truyền → mode Create */
  editData?: UserLocation;
  onClose: () => void;
  onSubmit: (dto: CreateUserLocationDto) => Promise<void>;
}

const INPUT_CLS =
  "w-full border border-[#ede0c4] rounded p-3 text-sm text-[#111827] focus:outline-none focus:border-[#c4a84f] bg-[#faf8f5] transition-colors";
const LABEL_CLS =
  "block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 font-sans";
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function AddressFormModal({
  editData,
  onClose,
  onSubmit,
}: AddressFormModalProps) {
  const isEdit = !!editData;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    label: editData?.label ?? "",
    receiverName: editData?.receiverName ?? "",
    phone: editData?.phone ?? "",
    address: editData?.address ?? "",
    note: editData?.note ?? "",
    provinceCode: editData?.provinceCode ?? "",
    districtCode: editData?.districtCode ?? "",
    wardCode: editData?.wardCode ?? "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setError("Không tải được danh sách tỉnh/thành"));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!form.provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    getDistricts(form.provinceCode).then((data) => {
      setDistricts(data);
      // Nếu đổi tỉnh, reset huyện + xã (trừ khi đang init edit)
      if (!editData || form.provinceCode !== editData.provinceCode) {
        setForm((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
        setWards([]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!form.districtCode) {
      setWards([]);
      return;
    }
    getWards(form.districtCode).then((data) => {
      setWards(data);
      if (!editData || form.districtCode !== editData.districtCode) {
        setForm((prev) => ({ ...prev, wardCode: "" }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.districtCode]);

  // Preload districts/wards for edit mode
  useEffect(() => {
    if (editData?.provinceCode) {
      getDistricts(editData.provinceCode).then(setDistricts);
    }
    if (editData?.districtCode) {
      getWards(editData.districtCode).then(setWards);
    }
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !form.label ||
      !form.receiverName ||
      !form.phone ||
      !form.address ||
      !form.provinceCode ||
      !form.districtCode ||
      !form.wardCode
    ) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        label: form.label,
        receiverName: form.receiverName,
        phone: form.phone,
        address: form.address,
        note: form.note || undefined,
        provinceCode: form.provinceCode,
        districtCode: form.districtCode,
        wardCode: form.wardCode,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ede0c4]">
          <h2
            className="text-lg font-bold text-[#2c1a00] uppercase tracking-wide"
            style={serif}
          >
            {isEdit ? "Cập nhật địa chỉ" : "Thêm Địa Chỉ Mới"}
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-xl font-light"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Body container (dùng div thay form để không bao giờ bị lồng form) */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded p-3">
              {error}
            </div>
          )}

          {/* Label (nhãn địa chỉ) */}
          <div>
            <label className={LABEL_CLS}>
              Nhãn địa chỉ *{" "}
              <span className="text-gray-400 normal-case font-normal">
                (vd: Nhà riêng, Công ty...)
              </span>
            </label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              maxLength={50}
              required
              placeholder="Nhà riêng"
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Receiver Name */}
            <div>
              <label className={LABEL_CLS}>Họ tên người nhận *</label>
              <input
                type="text"
                name="receiverName"
                value={form.receiverName}
                onChange={handleChange}
                maxLength={100}
                required
                placeholder="Nguyễn Văn A"
                className={INPUT_CLS}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={LABEL_CLS}>Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="0901234567"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Province */}
          <div>
            <label className={LABEL_CLS}>Tỉnh / Thành phố *</label>
            <select
              name="provinceCode"
              value={form.provinceCode}
              onChange={handleChange}
              required
              className={INPUT_CLS}
            >
              <option value="">Chọn tỉnh / thành</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className={LABEL_CLS}>Quận / Huyện *</label>
            <select
              name="districtCode"
              value={form.districtCode}
              onChange={handleChange}
              required
              disabled={!form.provinceCode}
              className={`${INPUT_CLS} disabled:opacity-60`}
            >
              <option value="">Chọn quận / huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ward */}
          <div>
            <label className={LABEL_CLS}>Phường / Xã *</label>
            <select
              name="wardCode"
              value={form.wardCode}
              onChange={handleChange}
              required
              disabled={!form.districtCode}
              className={`${INPUT_CLS} disabled:opacity-60`}
            >
              <option value="">Chọn phường / xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address detail */}
          <div>
            <label className={LABEL_CLS}>Địa chỉ chi tiết (số nhà, đường...) *</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              maxLength={255}
              required
              placeholder="123 Đường Láng"
              className={INPUT_CLS}
            />
          </div>

          {/* Note */}
          <div>
            <label className={LABEL_CLS}>Ghi chú (tùy chọn)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={2}
              maxLength={255}
              placeholder="Giao giờ hành chính..."
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-[#f3ebdb]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-5 py-2.5 rounded border border-[#ede0c4] text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
              style={serif}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-6 py-2.5 rounded bg-[#c4a84f] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors disabled:opacity-50"
              style={serif}
            >
              {loading
                ? "Đang lưu..."
                : isEdit
                  ? "Cập nhật"
                  : "Lưu địa chỉ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

