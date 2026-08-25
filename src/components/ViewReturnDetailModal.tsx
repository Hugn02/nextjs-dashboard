"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/api-client";
import { formatImageUrl } from "@/src/lib/cloudinary";
import {
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  User,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  X
} from "lucide-react";

interface ViewReturnDetailModalProps {
  order: any;
  onClose: () => void;
  onCancelSuccess?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const REASON_MAP: Record<string, string> = {
  NUT_VO_VAN_CHUYEN: "Hàng nứt vỡ / hỏng hóc do vận chuyển",
  GIAO_SAI_MAU: "Giao sai mẫu mã / sản phẩm",
  HANG_LOI_XUONG: "Sản phẩm bị lỗi sản xuất xưởng Gốm",
  KHAC: "Lý do khác",
  PRODUCT_DEFECT: "Sản phẩm bị lỗi, hỏng hóc từ nhà sản xuất",
  WRONG_ITEM: "Giao sai sản phẩm, sai kích thước hoặc màu sắc",
  DAMAGED_TRANSPORT: "Hàng bị nứt, vỡ, móp méo trong quá trình vận chuyển",
  NOT_AS_DESCRIBED: "Sản phẩm không đúng so với hình ảnh/mô tả trên website",
  CHANGE_MIND: "Đổi ý, không còn nhu cầu sử dụng",
  OTHER: "Lý do khác",
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PENDING: { label: "Đang chờ duyệt", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  APPROVED: { label: "Đã duyệt (Đang chuyển khoản)", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  COMPLETED: { label: "Hoàn tất hoàn tiền", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  REJECTED: { label: "Yêu cầu bị từ chối", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  CANCELLED: { label: "Đã hủy yêu cầu", bg: "bg-gray-150", text: "text-gray-700", border: "border-gray-300" },
};

export default function ViewReturnDetailModal({
  order,
  onClose,
  onCancelSuccess,
}: ViewReturnDetailModalProps) {
  const [returnReq, setReturnReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const orderId = order?.publicId || order?._id || order?.id;

  useEffect(() => {
    let isMounted = true;
    const fetchReturnDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`${API_URL}/returns/order/${orderId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Không thể tải thông tin yêu cầu hoàn trả.");
        }
        const data = await res.json();
        if (isMounted) {
          setReturnReq(data.data || data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Không tìm thấy dữ liệu yêu cầu hoàn trả.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (orderId) {
      fetchReturnDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleExecuteCancel = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/returns/order/${orderId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể hủy yêu cầu hoàn trả.");
      }
      alert("Đã hủy yêu cầu hoàn trả thành công!");
      if (onCancelSuccess) onCancelSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi hủy yêu cầu hoàn trả.");
    } finally {
      setCancelling(false);
      setShowConfirmCancel(false);
    }
  };

  const statusCfg = returnReq ? STATUS_MAP[returnReq.status] || STATUS_MAP.PENDING : STATUS_MAP.PENDING;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-[#ede0c4] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-5 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#8b2500]" />
              Chi Tiết Yêu Cầu Hoàn Trả
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Đơn hàng: <span className="font-mono font-bold text-[#8b2500]">{orderId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 md:p-6 space-y-5 font-sans max-h-[75vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-gray-500 font-sans space-y-2">
              <div className="w-8 h-8 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Đang tải dữ liệu yêu cầu hoàn trả...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : returnReq ? (
            <>
              {/* Status Header Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${statusCfg.bg} ${statusCfg.border}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">Trạng thái xử lý</span>
                  <span className={`text-sm font-bold ${statusCfg.text}`}>{statusCfg.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">Ngày gửi yêu cầu</span>
                  <span className="text-xs font-medium text-gray-700 font-mono">
                    {new Date(returnReq.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Lý do hoàn trả */}
              <div className="space-y-1.5 p-3.5 bg-[#fbfaf8] border border-[#ede0c4] rounded-lg">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b2500] block">Lý do hoàn trả</span>
                <p className="text-xs font-semibold text-gray-800">
                  {REASON_MAP[returnReq.reason] || returnReq.reason || "Không rõ lý do"}
                </p>
                {returnReq.customerNote && (
                  <div className="pt-2 border-t border-[#ede0c4]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Mô tả từ khách hàng:</span>
                    <p className="text-xs text-gray-600 leading-relaxed italic bg-white p-2.5 rounded border border-[#ede0c4]/40">
                      "{returnReq.customerNote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Hình ảnh bằng chứng */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#c4a84f]" />
                  <span>Hình ảnh bằng chứng ({returnReq.evidenceImages?.length || 0} ảnh)</span>
                </span>
                {returnReq.evidenceImages && returnReq.evidenceImages.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {returnReq.evidenceImages.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImage(formatImageUrl(img))}
                        className="group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative hover:border-[#c4a84f] transition cursor-pointer"
                      >
                        <img
                          src={formatImageUrl(img)}
                          alt={`Bằng chứng ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                          Xem
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Không có hình ảnh bằng chứng.</p>
                )}
              </div>

              {/* Tài khoản ngân hàng nhận tiền */}
              {returnReq.bankAccount && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Tài khoản ngân hàng nhận tiền hoàn</span>
                  </span>
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Ngân hàng:</span>
                      <span className="font-bold text-gray-800">{returnReq.bankAccount.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Số tài khoản:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">{returnReq.bankAccount.accountNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Chủ tài khoản:</span>
                      <span className="font-bold text-gray-800 uppercase">{returnReq.bankAccount.accountHolder}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Phản hồi từ Admin Bát Tràng */}
              {returnReq.adminNote && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Phản hồi từ Ban quản trị Bát Tràng
                  </span>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    {returnReq.adminNote}
                  </p>
                </div>
              )}

              {/* Cảnh báo từ chối */}
              {returnReq.status === "REJECTED" && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Yêu cầu đã bị từ chối
                  </span>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Rất tiếc, yêu cầu hoàn trả cho đơn hàng này không được chấp thuận. Nếu có thắc mắc, vui lòng liên hệ hotline hỗ trợ khách hàng của Bát Tràng.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-5 py-3.5 flex justify-between items-center gap-2">
          {returnReq && returnReq.status === "PENDING" ? (
            <button
              type="button"
              onClick={() => setShowConfirmCancel(true)}
              className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-xs font-bold uppercase tracking-[0.5px] rounded transition font-sans cursor-pointer flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Hủy yêu cầu này</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2c1a00] hover:bg-[#c4a84f] text-white text-xs font-bold tracking-[1px] uppercase rounded transition font-sans cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal for Cancel Return Request */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-[#ede0c4] p-5 space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase">
                Xác nhận Hủy Yêu Cầu
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bạn có chắc chắn muốn hủy Yêu cầu hoàn trả cho đơn hàng <span className="font-mono font-bold text-[#8b2500]">{orderId}</span>?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                disabled={cancelling}
                className="px-3.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded hover:bg-gray-200 transition cursor-pointer"
              >
                Giữ yêu cầu
              </button>
              <button
                type="button"
                onClick={handleExecuteCancel}
                disabled={cancelling}
                className="px-4 py-1.5 bg-[#8b2500] text-white text-xs font-bold uppercase rounded hover:bg-[#6c1d00] transition cursor-pointer disabled:opacity-50"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 z-[100000] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-black">
            <img
              src={previewImage}
              alt="Xem ảnh lớn"
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
