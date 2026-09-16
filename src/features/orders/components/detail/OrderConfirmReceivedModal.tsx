"use client";

import React from "react";
import { Package, X, CheckCircle2, Loader2 } from "lucide-react";
import { OrderDetail } from "../../types";

interface OrderConfirmReceivedModalProps {
    order: OrderDetail;
    confirmingReceipt: boolean;
    onClose: () => void;
    onConfirm: () => void;
    formatPrice?: (n: number) => string;
}

export default function OrderConfirmReceivedModal({
    order,
    confirmingReceipt,
    onClose,
    onConfirm,
    formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫",
}: OrderConfirmReceivedModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px] flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#c4a84f]" />
                        <span>Xác nhận đã nhận hàng</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 font-sans leading-relaxed">
                        Bạn xác nhận đã nhận đầy đủ kiện hàng mã{" "}
                        <strong className="font-mono font-bold text-[#2c1a00]">{order.publicId}</strong> từ shipper và sản phẩm gốm sứ nguyên vẹn?
                    </p>
                    {order.paymentMethod === "cod" && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-sans">
                            <strong className="block mb-0.5">Xác nhận thanh toán COD:</strong>
                            Số tiền <strong>{formatPrice(order.total)}</strong> đã được thanh toán cho shipper và đơn hàng sẽ chuyển sang trạng thái <strong>Hoàn thành</strong>.
                        </div>
                    )}
                    <p className="text-xs text-gray-400 font-sans mt-3 italic">
                        * Sau khi hoàn tất, bạn có thể tham gia viết đánh giá sản phẩm để chia sẻ trải nghiệm.
                    </p>
                </div>
                <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-6 py-4 flex justify-end gap-3 font-sans">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={confirmingReceipt}
                        className="px-5 py-2.5 bg-gray-150 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition cursor-pointer"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirmingReceipt}
                        className="px-5 py-2.5 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[1px] uppercase rounded transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                        {confirmingReceipt ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Tôi đã nhận đủ hàng</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
