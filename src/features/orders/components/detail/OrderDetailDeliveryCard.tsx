"use client";

import React from "react";
import {
    User,
    Phone,
    MapPin,
    Truck,
    MessageSquare,
} from "lucide-react";
import { OrderDetail } from "../../types";

interface OrderDetailDeliveryCardProps {
    order: OrderDetail;
}

export default function OrderDetailDeliveryCard({ order }: OrderDetailDeliveryCardProps) {
    return (
        <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] border-b border-[#ede0c4] pb-2 font-sans">
                Thông tin giao hàng
            </h3>
            <div className="space-y-4 font-sans text-sm text-gray-700">
                {/* Customer Name */}
                <div className="flex gap-3">
                    <User className="w-5 h-5 text-[#c4a84f] flex-shrink-0" />
                    <div>
                        <span className="text-xs text-gray-400 block">Khách nhận hàng</span>
                        <span className="font-semibold text-gray-800">{order.customerName}</span>
                    </div>
                </div>

                {/* Phone Number */}
                <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-[#c4a84f] flex-shrink-0" />
                    <div>
                        <span className="text-xs text-gray-400 block">Số điện thoại</span>
                        <span className="font-semibold text-gray-800">{order.phone}</span>
                    </div>
                </div>

                {/* Address */}
                <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-[#c4a84f] flex-shrink-0" />
                    <div>
                        <span className="text-xs text-gray-400 block">Địa chỉ nhận hàng</span>
                        <span className="font-semibold text-gray-750 leading-relaxed">
                            {order.address}, {order.ward}, {order.district}, {order.province}
                        </span>
                    </div>
                </div>

                {/* Shipping Provider & Tracking */}
                <div className="flex gap-3 border-t border-gray-100 pt-3">
                    <Truck className="w-5 h-5 text-[#c4a84f] flex-shrink-0 mt-0.5" />
                    <div className="w-full space-y-1">
                        <span className="text-xs text-gray-400 block">Đơn vị vận chuyển</span>
                        <div className="font-semibold text-gray-800 text-sm">
                            {order.shippingProviderName || order.shippingProvider || "Giao hàng Tiêu chuẩn"}
                        </div>
                        {order.trackingCode && (
                            <div className="mt-1.5 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-md">
                                <span className="text-[10px] text-amber-700 block font-sans font-medium uppercase tracking-wider mb-0.5">
                                    Mã vận đơn (Tracking Code)
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-900 break-all select-all block leading-normal">
                                    {order.trackingCode}
                                </span>
                            </div>
                        )}
                        {order.expectedDeliveryDate && (
                            <span className="text-xs text-gray-500 block pt-0.5">
                                Dự kiến giao: {order.expectedDeliveryDate}
                            </span>
                        )}
                    </div>
                </div>

                {/* Note */}
                {order.note && (
                    <div className="flex gap-3 border-t border-gray-100 pt-3">
                        <MessageSquare className="w-5 h-5 text-[#c4a84f] flex-shrink-0" />
                        <div className="w-full">
                            <span className="text-xs text-gray-400 block">Ghi chú giao nhận</span>
                            <p className="text-xs italic text-gray-500 bg-[#fbfaf8] border border-gray-200 rounded p-2.5 mt-1 leading-normal">
                                &ldquo;{order.note}&rdquo;
                            </p>
                        </div>
                    </div>
                )}

                {/* Hotline contact bar */}
                <div className="border-t border-[#ede0c4] pt-3.5 mt-2 flex items-center justify-between text-xs font-sans text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#c4a84f]" />
                        Cần hỗ trợ đơn hàng?
                    </span>
                    <a
                        href="tel:0901234567"
                        className="font-bold text-[#8b6914] hover:text-[#c4a84f] transition-colors no-underline"
                    >
                        Hotline: 0901.234.567
                    </a>
                </div>
            </div>
        </div>
    );
}
