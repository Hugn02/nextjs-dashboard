"use client";

import React from "react";

interface OrderCancelModalProps {
    publicId?: string;
    cancelling: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function OrderCancelModal({
    publicId,
    cancelling,
    onClose,
    onConfirm,
}: OrderCancelModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                    <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
                        Xác nhận hủy đơn hàng
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 font-sans leading-relaxed">
                        Bạn có chắc chắn muốn hủy đơn hàng này không?
                    </p>
                    {publicId && (
                        <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-700 break-all">
                            {publicId}
                        </div>
                    )}
                    <p className="text-xs text-red-500 font-sans font-medium">
                        * Lưu ý: Hành động hủy đơn hàng sẽ không thể khôi phục sau khi hoàn tất.
                    </p>
                </div>
                <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-6 py-4 flex justify-end gap-3 font-sans">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={cancelling}
                        className="px-5 py-2.5 bg-gray-150 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition font-sans cursor-pointer"
                    >
                        Quay lại
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={cancelling}
                        className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-sans cursor-pointer"
                    >
                        {cancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                    </button>
                </div>
            </div>
        </div>
    );
}
