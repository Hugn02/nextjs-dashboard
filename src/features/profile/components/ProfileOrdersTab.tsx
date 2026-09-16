"use client";

import React from "react";
import Link from "next/link";

interface ProfileOrdersTabProps {
    orders: any[];
    loadingOrders: boolean;
}

const getOrderStatusConfig = (status: string) => {
    const configs: { [key: string]: { text: string; bg: string; border: string; textClass: string } } = {
        pending: { text: "Chờ xác nhận", bg: "bg-[#fffbeb]", border: "border-[#fef3c7]", textClass: "text-[#d97706]" },
        confirmed: { text: "Đã xác nhận", bg: "bg-[#eff6ff]", border: "border-[#dbeafe]", textClass: "text-[#2563eb]" },
        shipping: { text: "Đang vận chuyển", bg: "bg-[#e0e7ff]", border: "border-[#c7d2fe]", textClass: "text-[#4f46e5]" },
        completed: { text: "Hoàn thành", bg: "bg-[#ecfdf5]", border: "border-[#d1fae5]", textClass: "text-[#059669]" },
        return_requested: { text: "Yêu cầu hoàn trả", bg: "bg-[#fff7ed]", border: "border-[#ffedd5]", textClass: "text-[#c2410c]" },
        returned: { text: "Đã hoàn trả", bg: "bg-[#f0fdfa]", border: "border-[#ccfbf1]", textClass: "text-[#0f766e]" },
        cancelled: { text: "Đã hủy", bg: "bg-[#fef2f2]", border: "border-[#fee2e2]", textClass: "text-[#dc2626]" },
    };
    const key = (status || "").toLowerCase();
    return configs[key] || { text: status || "Chờ xử lý", bg: "bg-[#f8fafc]", border: "border-[#f1f5f9]", textClass: "text-[#64748b]" };
};

export default function ProfileOrdersTab({
    orders,
    loadingOrders,
}: ProfileOrdersTabProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="border-b border-[#ede0c4] pb-3">
                <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-wider">Đơn Mua của tôi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Xem danh sách các đơn hàng đã đặt</p>
            </div>

            {loadingOrders ? (
                <div className="py-8 text-center text-gray-400 text-xs italic">Đang tải lịch sử đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-xs italic border border-dashed border-[#ede0c4] rounded flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#fbf8f2] border border-[#ede0c4] flex items-center justify-center text-[#c4a84f] mb-1">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                    </div>
                    <span>Bạn chưa có đơn hàng nào.</span>
                    <Link
                        href="/products/all"
                        className="mt-2 px-4 py-2 bg-[#c4a84f] text-white text-xs font-bold tracking-wider uppercase rounded no-underline"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {orders.slice(0, 5).map((order) => {
                        const statusCfg = getOrderStatusConfig(order.status);
                        return (
                            <Link
                                key={order.id || order.publicId}
                                href={`/orders/${order.publicId || order.id || order._id}`}
                                className="p-3.5 border border-[#ede0c4] rounded-lg bg-white flex flex-col gap-2 hover:border-[#c4a84f] hover:shadow-sm transition-all no-underline block group"
                            >
                                <div className="flex justify-between items-center border-b border-[#f3ebdb] pb-2 text-xs">
                                    <span className="font-bold text-[#2c1a00] group-hover:text-[#c4a84f] transition-colors">
                                        Đơn hàng: #{order.publicId}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.textClass}`}>
                                        {statusCfg.text}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Số lượng: {order.items?.length || 0} sản phẩm</span>
                                    <span className="font-bold text-red-600 text-sm">{(order.total || 0).toLocaleString("vi-VN")}₫</span>
                                </div>
                            </Link>
                        );
                    })}
                    <Link
                        href="/orders/history"
                        className="w-full py-2.5 text-center bg-[#faf7f2] border border-[#ede0c4] text-[#8b6914] rounded text-xs font-bold uppercase tracking-wider hover:bg-[#f3ebdb] no-underline transition-colors mt-1"
                    >
                        Xem chi tiết toàn bộ lịch sử đơn hàng
                    </Link>
                </div>
            )}
        </div>
    );
}
