"use client";

import React from "react";
import {
    RotateCw,
    CheckCircle2,
    Loader2,
    Eye,
    RotateCcw,
    Star,
} from "lucide-react";
import { OrderDetail } from "../../types";

interface OrderDetailPaymentCardProps {
    order: OrderDetail;
    syncingShipping: boolean;
    syncMsg: string | null;
    reordering: boolean;
    allReviewed: boolean;
    onSyncShipping: () => void;
    onConfirmReceived: () => void;
    onCancelOrder: () => void;
    onReorder: () => void;
    onViewReturn: () => void;
    onRequestReturn: () => void;
    onOpenReview: () => void;
    formatPrice?: (n: number) => string;
}

export default function OrderDetailPaymentCard({
    order,
    syncingShipping,
    syncMsg,
    reordering,
    allReviewed,
    onSyncShipping,
    onConfirmReceived,
    onCancelOrder,
    onReorder,
    onViewReturn,
    onRequestReturn,
    onOpenReview,
    formatPrice = (n: number) => n.toLocaleString("vi-VN") + "₫",
}: OrderDetailPaymentCardProps) {
    const getSubtotal = () => {
        return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getPaymentMethodText = (method: string) => {
        const methodMap: { [key: string]: string } = {
            cod: "Thanh toán khi nhận hàng (COD)",
            banking: "Chuyển khoản ngân hàng",
            vnpay: "Thanh toán qua VNPAY",
        };
        return methodMap[method] || method.toUpperCase();
    };

    const getPaymentStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            unpaid: "Chưa thanh toán",
            paid: "Đã thanh toán",
            refunded: "Đã hoàn tiền",
        };
        return statusMap[status] || status;
    };

    const isCompleted = order.status === "completed";
    const isPending = order.status === "pending";
    const isCancelled = order.status === "cancelled";
    const isShipping = order.status === "shipping";
    const isReturnRelated = order.status === "return_requested" || order.status === "returned";

    const completionTime = new Date(order.updatedAt || order.createdAt).getTime();
    const diffDays = (Date.now() - completionTime) / (1000 * 3600 * 24);
    const canReturn = diffDays <= 7;
    const canReview = diffDays <= 30;

    return (
        <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] border-b border-[#ede0c4] pb-2 font-sans">
                Chi tiết hóa đơn
            </h3>
            <div className="space-y-2 text-sm text-gray-500 font-sans">
                <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="text-gray-800 font-medium">{formatPrice(getSubtotal())}</span>
                </div>
                {((order.discountAmount ?? 0) > 0 || order.couponCode) && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                        <span className="flex items-center gap-1.5">
                            <span>Giảm giá (Voucher):</span>
                            {order.couponCode && (
                                <span className="font-mono text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                    {order.couponCode}
                                </span>
                            )}
                        </span>
                        <span className="font-bold">-{formatPrice(order.discountAmount || 0)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span className="text-gray-800 font-medium">
                        {order.shippingFee > 0 ? formatPrice(order.shippingFee) : "Miễn phí"}
                    </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span>Phương thức thanh toán:</span>
                    <span className="text-gray-800 font-semibold">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Trạng thái thanh toán:</span>
                    <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-red-500"}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                    </span>
                </div>
            </div>
            <div className="flex justify-between items-center border-t border-[#ede0c4] pt-4 font-sans">
                <span className="text-sm font-bold uppercase text-[#2c1a00] tracking-wider">Tổng thanh toán:</span>
                <span className="text-2xl font-extrabold text-[#8b2500]">{formatPrice(order.total)}</span>
            </div>

            {/* Hành động đơn hàng ở chân thẻ Chi tiết hóa đơn */}
            {(isCompleted || isPending || isCancelled || isReturnRelated || isShipping) && (
                <div className="border-t border-[#ede0c4] pt-4 mt-4 flex flex-wrap gap-2.5 justify-end items-center font-sans">
                    {/* Đơn Đang vận chuyển (shipping) */}
                    {isShipping && (
                        <>
                            {syncMsg && (
                                <span className="text-xs text-blue-600 font-medium italic mr-auto">
                                    {syncMsg}
                                </span>
                            )}
                            {order.trackingCode && order.shippingStatus !== "delivered" && (
                                <button
                                    type="button"
                                    onClick={onSyncShipping}
                                    disabled={syncingShipping}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 hover:border-[#c4a84f] text-gray-700 hover:text-[#8b6914] text-xs font-semibold rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                                    title="Tra cứu trạng thái vận đơn trực tiếp từ cổng vận chuyển"
                                >
                                    <RotateCw className={`w-3.5 h-3.5 ${syncingShipping ? "animate-spin text-amber-600" : "text-gray-500"}`} />
                                    <span>{syncingShipping ? "Đang kiểm tra..." : "Tra cứu vận đơn"}</span>
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={order.shippingStatus !== "delivered"}
                                onClick={onConfirmReceived}
                                className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold tracking-[0.5px] uppercase rounded transition-all font-sans flex items-center justify-center gap-2 shadow-xs ${order.shippingStatus === "delivered"
                                    ? "bg-[#c4a84f] hover:bg-[#a8893a] text-white cursor-pointer ring-2 ring-[#c4a84f]/20 active:scale-[0.99]"
                                    : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                title={order.shippingStatus !== "delivered" ? "Chỉ khả dụng sau khi đơn vị vận chuyển cập nhật trạng thái Giao hàng thành công" : "Bấm để xác nhận bạn đã nhận đủ hàng"}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Đã nhận được hàng</span>
                            </button>
                        </>
                    )}

                    {/* Đơn Chờ xác nhận (pending) */}
                    {isPending && (
                        <button
                            type="button"
                            onClick={onCancelOrder}
                            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold tracking-[0.5px] uppercase rounded transition-all font-sans cursor-pointer"
                        >
                            Hủy đơn hàng này
                        </button>
                    )}

                    {/* Đơn Đã hủy (cancelled) */}
                    {isCancelled && (
                        <button
                            type="button"
                            onClick={onReorder}
                            disabled={reordering}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[0.5px] uppercase px-5 py-2.5 rounded transition-all font-sans cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {reordering ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RotateCw className="w-4 h-4" />
                            )}
                            <span>{reordering ? "Đang thêm vào giỏ..." : "Mua lại đơn hàng này"}</span>
                        </button>
                    )}

                    {/* Đơn Hoàn trả (return_requested / returned) */}
                    {isReturnRelated && (
                        <>
                            <button
                                type="button"
                                onClick={onViewReturn}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#fdf8ef] border border-[#c4a84f] text-[#8b6914] hover:bg-[#f5ebd6] text-xs font-bold tracking-[0.5px] uppercase px-4 py-2.5 rounded transition-all font-sans cursor-pointer"
                            >
                                <Eye className="w-4 h-4 text-[#c4a84f]" />
                                <span>Xem Yêu cầu Hoàn trả</span>
                            </button>
                            {order.status === "returned" && (
                                <button
                                    type="button"
                                    onClick={onReorder}
                                    disabled={reordering}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[0.5px] uppercase px-5 py-2.5 rounded transition-all font-sans cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {reordering ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RotateCw className="w-4 h-4" />
                                    )}
                                    <span>{reordering ? "Đang thêm..." : "Mua lại đơn hàng này"}</span>
                                </button>
                            )}
                        </>
                    )}

                    {/* Đơn Hoàn thành (completed) */}
                    {isCompleted && (
                        <>
                            {canReturn && (
                                <button
                                    type="button"
                                    onClick={onRequestReturn}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold tracking-[0.5px] uppercase px-4 py-2.5 rounded transition-all font-sans cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Yêu cầu hoàn trả</span>
                                </button>
                            )}

                            {/* Đánh giá đơn hàng */}
                            {!allReviewed && canReview && (
                                <button
                                    type="button"
                                    onClick={onOpenReview}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white border border-[#c4a84f] text-[#8b6914] hover:bg-[#fdf8ef] text-xs font-bold tracking-[0.5px] uppercase px-4 py-2.5 rounded transition-all font-sans cursor-pointer"
                                >
                                    <Star className="w-3.5 h-3.5 fill-[#c4a84f] text-[#c4a84f]" />
                                    <span>Đánh giá đơn hàng</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onReorder}
                                disabled={reordering}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[0.5px] uppercase px-5 py-2.5 rounded transition-all font-sans cursor-pointer shadow-sm disabled:opacity-50"
                            >
                                {reordering ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RotateCw className="w-4 h-4" />
                                )}
                                <span>{reordering ? "Đang thêm..." : "Mua lại đơn hàng này"}</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
