"use client";

import React from "react";
import { XCircle, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { OrderHistoryItem } from "@/src/features/orders/types";

interface OrderCancelReturnModalProps {
    order: OrderHistoryItem;
    cancellingReturnId: string | null;
    cancelReturnSuccess: boolean;
    cancelReturnError: string | null;
    onClose: () => void;
    onConfirm: (order: OrderHistoryItem) => void;
    onSuccessClose: () => void;
}

export default function OrderCancelReturnModal({
    order,
    cancellingReturnId,
    cancelReturnSuccess,
    cancelReturnError,
    onClose,
    onConfirm,
    onSuccessClose,
}: OrderCancelReturnModalProps) {
    const isCancelling = !!cancellingReturnId;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
                            Hủy Yêu Cầu Hoàn Trả
                        </h3>
                        <p className="text-xs text-gray-500 font-sans mt-0.5">
                            Đơn hàng: <span className="font-mono font-bold text-[#8b2500]">{order.publicId}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (cancelReturnSuccess) {
                                onSuccessClose();
                            } else {
                                onClose();
                            }
                        }}
                        className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                {cancelReturnSuccess ? (
                    <div className="p-6 text-center space-y-4 font-sans animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
                                Đã Hủy Yêu Cầu Hoàn Trả!
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 font-sans leading-relaxed">
                                Yêu cầu hoàn trả cho đơn hàng <span className="font-mono font-bold text-[#8b2500]">{order.publicId}</span> đã được hủy thành công. Đơn hàng của bạn đã quay trở lại trạng thái <strong>Hoàn thành</strong>.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onSuccessClose}
                            className="w-full py-3 bg-[#2c1a00] hover:bg-[#c4a84f] text-white text-xs font-bold tracking-[2px] uppercase rounded-lg transition-all font-['Cormorant_Garamond',_serif] shadow-md cursor-pointer mt-2"
                        >
                            Đồng ý & Đóng
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-4 font-sans">
                        {cancelReturnError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{cancelReturnError}</span>
                            </div>
                        )}
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-50 text-[#8b2500] rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
                                <RotateCcw className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed font-sans">
                                Bạn có chắc chắn muốn <strong>HỦY Yêu cầu hoàn trả</strong> cho đơn hàng này?
                            </p>
                            <div className="my-3 p-2.5 bg-[#fbfaf8] border border-[#ede0c4] rounded font-mono text-xs font-bold text-[#8b2500]">
                                {order.publicId}
                            </div>
                            <p className="text-[11px] text-gray-500 font-sans italic">
                                Sau khi hủy, đơn hàng sẽ quay lại trạng thái Hoàn thành. Bạn vẫn có thể gửi lại yêu cầu nếu chưa hết thời hạn 14 ngày.
                            </p>
                        </div>

                        <div className="pt-3 border-t border-[#ede0c4] flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isCancelling}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition cursor-pointer font-sans"
                            >
                                Giữ Yêu cầu
                            </button>
                            <button
                                type="button"
                                onClick={() => onConfirm(order)}
                                disabled={isCancelling}
                                className="px-5 py-2 bg-[#8b2500] text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-[#6c1d00] transition shadow-sm disabled:opacity-50 cursor-pointer font-sans"
                            >
                                {isCancelling ? "Đang xử lý..." : "Xác nhận Hủy"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
