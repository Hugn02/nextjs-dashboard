"use client";

import { useState, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/api-client";
import { formatCloudinaryUrl } from "@/src/lib/cloudinary";
import { X, Upload, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

interface ReturnRequestModalProps {
  order: {
    _id?: string;
    id?: string;
    publicId: string;
    total: number;
    createdAt: string;
    items: Array<{
      product: {
        productName: string;
        imageUrl?: string[];
      };
      quantity: number;
      price: number;
    }>;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const MAX_IMAGES = 5;

export default function ReturnRequestModal({ order, onClose, onSuccess }: ReturnRequestModalProps) {
  const [reason, setReason] = useState<string>("NUT_VO_VAN_CHUYEN");
  const [reasonDetails, setReasonDetails] = useState<string>("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - evidenceImages.length;
    if (remainingSlots <= 0) {
      setError(`Bạn chỉ được chọn tối đa ${MAX_IMAGES} ảnh bằng chứng.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`Hệ thống chỉ nhận thêm ${remainingSlots} ảnh (tối đa ${MAX_IMAGES} ảnh bằng chứng).`);
    } else {
      setError(null);
    }

    setUploadingImages(true);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      // Validation 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetchWithAuth(`${API_URL}/returns/upload`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          let rawUrl = "";
          if (typeof json === "string") rawUrl = json;
          else if (typeof json.data === "string") rawUrl = json.data;
          else if (json.data && typeof json.data.data === "string") rawUrl = json.data.data;
          else if (json.data && typeof json.data.url === "string") rawUrl = json.data.url;
          else if (typeof json.url === "string") rawUrl = json.url;

          if (rawUrl) {
            uploadedUrls.push(rawUrl);
          } else {
            const base64 = await readFileAsBase64(file);
            uploadedUrls.push(base64);
          }
        } else {
          // Fallback reading base64
          const base64 = await readFileAsBase64(file);
          uploadedUrls.push(base64);
        }
      } catch (err) {
        try {
          const base64 = await readFileAsBase64(file);
          uploadedUrls.push(base64);
        } catch (base64Err) {
          console.error("Lỗi đọc file:", base64Err);
        }
      }
    }

    setEvidenceImages((prev) => [...prev, ...uploadedUrls]);
    setUploadingImages(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError("Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để nhận tiền hoàn.");
      return;
    }

    setLoading(true);
    setError(null);

    const orderId = order._id || order.id || order.publicId;

    try {
      const res = await fetchWithAuth(`${API_URL}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason,
          reasonDetails,
          evidenceImages,
          bankAccount: {
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            accountHolder: accountHolder.trim().toUpperCase(),
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể gửi yêu cầu hoàn trả.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 pt-24 pb-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-[#ede0c4] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
              Yêu cầu Hoàn trả / Hoàn tiền
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Đơn hàng: <span className="font-mono font-bold text-[#8b2500]">{order.publicId}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-5 my-auto font-sans animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
                Gửi Yêu Cầu Hoàn Trả Thành Công!
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-sans">
                Yêu cầu hoàn trả cho đơn hàng <span className="font-mono font-bold text-[#8b2500]">{order.publicId}</span> đã được ghi nhận.
              </p>
            </div>
            <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded-xl p-4 text-left space-y-2.5 text-xs text-gray-700 font-sans">
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#f4ebd0] text-[#8b6914] flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>Bộ phận chăm sóc khách hàng Gốm Sứ Bát Tràng sẽ tiếp nhận và kiểm tra thông tin của bạn trong <strong>24h - 48h</strong> làm việc.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#f4ebd0] text-[#8b6914] flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>Trạng thái duyệt và tiến trình chuyển khoản hoàn tiền sẽ được cập nhật trực tiếp tại <strong>Lịch sử đơn hàng</strong>.</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-3 bg-[#2c1a00] hover:bg-[#c4a84f] text-white text-xs font-bold tracking-[2px] uppercase rounded-lg transition-all font-['Cormorant_Garamond',_serif] shadow-md cursor-pointer"
            >
              Đồng ý & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason selection */}
            <div>
              <label className="block text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-1">
                Lý do yêu cầu hoàn trả <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#c4a84f] outline-none"
              >
                <option value="NUT_VO_VAN_CHUYEN">Hàng nứt vỡ / hỏng hóc do vận chuyển</option>
                <option value="GIAO_SAI_MAU">Giao sai mẫu mã / sản phẩm</option>
                <option value="HANG_LOI_XUONG">Sản phẩm bị lỗi sản xuất xưởng Gốm</option>
                <option value="KHAC">Lý do khác</option>
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-1">
                Mô tả chi tiết vấn đề
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả tình trạng sản phẩm, vết nứt vỡ hoặc chi tiết lỗi..."
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#c4a84f]"
              />
            </div>

            {/* Evidence images — File Upload from Device */}
            <div>
              <label className="block text-xs font-bold text-[#2c1a00] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Hình ảnh bằng chứng (Tải từ thiết bị)</span>
                <span className="text-[10px] text-gray-500 font-normal font-sans">
                  Đã chọn {evidenceImages.length}/{MAX_IMAGES} ảnh (Tối đa 5MB/ảnh)
                </span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={evidenceImages.length >= MAX_IMAGES || uploadingImages}
              />

              {/* Click / Drag-and-drop Zone */}
              {evidenceImages.length < MAX_IMAGES ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#ede0c4] hover:border-[#c4a84f] bg-[#fbfaf8] hover:bg-[#fffdf9] rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f4ebd0] text-[#8b6914] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    {uploadingImages ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2c1a00] font-sans">
                      {uploadingImages ? "Đang tải ảnh lên..." : "Bấm để chọn ảnh từ máy tính hoặc điện thoại"}
                    </p>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                      Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa {MAX_IMAGES} ảnh)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between font-sans font-semibold">
                  <span>Đã đạt giới hạn tối đa {MAX_IMAGES} ảnh bằng chứng.</span>
                  <span className="text-[11px] text-amber-600 font-normal">Xóa bớt ảnh ở dưới để chọn thêm</span>
                </div>
              )}

              {/* Selected Images Grid */}
              {evidenceImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-600 mb-1.5 font-sans">
                    Ảnh bằng chứng đã chọn ({evidenceImages.length}):
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {evidenceImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg border border-[#ede0c4] overflow-hidden group shadow-sm bg-gray-100">
                        <img src={formatCloudinaryUrl(url)} alt={`Bằng chứng ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bank Account Details */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-[#8b2500] uppercase tracking-wider mb-2 flex items-center gap-1 font-sans">
                <span>💳</span> Thông tin Ngân hàng nhận lại tiền hoàn
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                    Tên Ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Vietcombank, MBBank..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#c4a84f]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                    Số tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số TK..."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-[#c4a84f]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                    Tên chủ tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs uppercase outline-none focus:ring-2 focus:ring-[#c4a84f]"
                  />
                </div>
              </div>
            </div>

            {/* Footer Submit */}
            <div className="pt-3 border-t border-[#ede0c4] flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-5 py-2 bg-[#8b2500] text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-[#6c1d00] transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu hoàn trả"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
