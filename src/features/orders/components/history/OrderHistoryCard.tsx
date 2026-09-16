"use client";

import React from "react";
import Link from "next/link";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import { OrderHistoryItem } from "@/src/features/orders/types";
import {
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    AlertCircle,
    ChevronRight,
    RotateCcw,
    Eye,
    CreditCard,
    Loader2,
    RotateCw,
} from "lucide-react";

interface OrderHistoryCardProps {
    order: OrderHistoryItem;
    downloadingInvoiceId: string | null;
    cancellingReturnId: string | null;
    reorderingId: string | null;
    repayingId: string | null;
    cancellingId: string | null;
    onDownloadInvoice: (order: OrderHistoryItem) => void;
    onViewReturnModal: (order: OrderHistoryItem) => void;
    onOpenCancelReturnModal: (order: OrderHistoryItem) => void;
    onShowReturnModal: (order: OrderHistoryItem) => void;
    onReorder: (order: OrderHistoryItem) => void;
    onRepay: (order: OrderHistoryItem) => void;
    onCancelOrderModal: (order: OrderHistoryItem) => void;
}

const formatPrice = (n: number) => {
    return (n || 0).toLocaleString("vi-VN") + "₫";
};

const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { text: string; bg: string; textClass: string; icon: any } } = {
        pending: {
            text: "Chờ xác nhận",
            bg: "bg-[#fffbeb] border-[#fef3c7]",
            textClass: "text-[#d97706]",
            icon: Clock,
        },
        confirmed: {
            text: "Đã xác nhận",
            bg: "bg-[#eff6ff] border-[#dbeafe]",
            textClass: "text-[#2563eb]",
            icon: CheckCircle2,
        },
        shipping: {
            text: "Đang vận chuyển",
            bg: "bg-[#e0e7ff] border-[#c7d2fe]",
            textClass: "text-[#4f46e5]",
            icon: Truck,
        },
        completed: {
            text: "Hoàn thành",
            bg: "bg-[#ecfdf5] border-[#d1fae5]",
            textClass: "text-[#059669]",
            icon: CheckCircle2,
        },
        return_requested: {
            text: "Yêu cầu hoàn trả",
            bg: "bg-[#fff7ed] border-[#ffedd5]",
            textClass: "text-[#c2410c]",
            icon: RotateCcw,
        },
        returned: {
            text: "Đã hoàn trả/hoàn tiền",
            bg: "bg-[#f1f5f9] border-[#e2e8f0]",
            textClass: "text-[#475569]",
            icon: CheckCircle2,
        },
        cancelled: {
            text: "Đã hủy",
            bg: "bg-[#fef2f2] border-[#fee2e2]",
            textClass: "text-[#dc2626]",
            icon: XCircle,
        },
    };
    return configs[status] || {
        text: status,
        bg: "bg-[#f8fafc] border-[#f1f5f9]",
        textClass: "text-[#64748b]",
        icon: AlertCircle,
    };
};

export default function OrderHistoryCard({
    order,
    downloadingInvoiceId,
    cancellingReturnId,
    reorderingId,
    repayingId,
    cancellingId,
    onDownloadInvoice,
    onViewReturnModal,
    onOpenCancelReturnModal,
    onShowReturnModal,
    onReorder,
    onRepay,
    onCancelOrderModal,
}: OrderHistoryCardProps) {
    const statusCfg = getStatusConfig(order.status);
    const StatusIcon = statusCfg.icon;
    const orderId = order._id || order.id || order.publicId;

    const hasRepay = order.paymentStatus === "unpaid" && order.paymentMethod !== "cod" && order.status === "pending";
    const hasCancel = order.status === "pending" && (order.paymentMethod === "cod" || order.paymentStatus !== "paid");
    const hasCancelReturn = order.status === "return_requested";
    const canReorder = (order.status === "completed" || order.status === "returned" || order.status === "cancelled") && !!order.items && order.items.length > 0;
    const canReturn = order.status === "completed" && (() => {
        const referenceDate = new Date(order.updatedAt || order.createdAt).getTime();
        const diffDays = (Date.now() - referenceDate) / (1000 * 3600 * 24);
        return diffDays <= 7;
    })();

    const totalButtons = 2 + (hasRepay ? 1 : 0) + (hasCancel ? 1 : 0) + (canReturn ? 1 : 0) + (hasCancelReturn ? 1 : 0) + (canReorder ? 1 : 0);
    const detailColSpan = totalButtons === 3 ? "col-span-2 md:col-span-1" : "";

    return (
        <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
            {/* Header of Order Card */}
            <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400 font-sans">Mã đơn:</span>
                        <span className="font-mono text-sm font-semibold text-gray-800">{order.publicId}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400 font-sans">Ngày đặt:</span>
                        <span className="text-xs font-semibold text-gray-700 font-sans">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")} {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold font-sans ${statusCfg.bg} ${statusCfg.textClass}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusCfg.text}</span>
                </div>
            </div>

            {/* Items in Order */}
            <div className="divide-y divide-gray-100 px-6">
                {order.items.map((item, itemIdx) => {
                    const p = item.product || {};
                    const imgUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                    return (
                        <div key={itemIdx} className="py-4 flex gap-4 items-center">
                            <div className="relative w-16 h-16 bg-white border border-[#ede0c4] rounded overflow-hidden flex-shrink-0">
                                <ImageWithFallback
                                    src={imgUrl}
                                    alt={p.productName || "Sản phẩm"}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4
                                    className="text-sm font-semibold text-[#2c1a00] line-clamp-1 font-sans break-words [overflow-wrap:anywhere] [word-break:break-all]"
                                    title={p.productName || "Sản phẩm Bát Tràng"}
                                >
                                    {p.productName || "Sản phẩm Bát Tràng"}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 font-sans">
                                    Số lượng: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-gray-800 font-sans">
                                    {formatPrice((item.price || 0) * item.quantity)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer of Order Card */}
            <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-4 sm:px-5 py-3.5">
                {/* Total + payment badge row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-sans font-semibold whitespace-nowrap">Tổng thanh toán:</span>
                            <span className="text-base font-extrabold text-[#8b2500] font-sans">{formatPrice(order.total)}</span>
                        </div>
                        {order.paymentMethod && order.paymentMethod !== "cod" && (
                            <span className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans border ${
                                order.paymentStatus === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                                {order.paymentMethod.toUpperCase()}: {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons area */}
                <div className="grid grid-cols-2 gap-2 md:flex md:flex-row md:flex-nowrap md:justify-end md:gap-2">
                    {/* Tải hóa đơn PDF — always visible */}
                    <button
                        type="button"
                        onClick={() => onDownloadInvoice(order)}
                        disabled={downloadingInvoiceId === orderId}
                        className="h-9 px-2 bg-white border border-[#c4a84f] text-[#8b6914] hover:bg-[#fdf8ef] rounded text-[11px] font-bold tracking-[0.3px] uppercase transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto"
                    >
                        <FileText className="w-3.5 h-3.5 text-[#c4a84f] shrink-0" />
                        <span className="truncate">{downloadingInvoiceId === orderId ? "Đang xuất..." : "Tải hóa đơn PDF"}</span>
                    </button>

                    {/* Xem yêu cầu hoàn trả — if return_requested or returned */}
                    {(order.status === "return_requested" || order.status === "returned") && (
                        <button
                            type="button"
                            onClick={() => onViewReturnModal(order)}
                            className="h-9 px-2 bg-[#fdf8ef] text-[#8b6914] border border-[#c4a84f] hover:bg-[#f5ebd6] text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                        >
                            <Eye className="w-3.5 h-3.5 shrink-0 text-[#c4a84f]" />
                            <span className="truncate">Xem Yêu cầu Hoàn trả</span>
                        </button>
                    )}

                    {/* Hủy yêu cầu hoàn trả — only if return_requested */}
                    {hasCancelReturn && (
                        <button
                            type="button"
                            onClick={() => onOpenCancelReturnModal(order)}
                            disabled={cancellingReturnId === orderId}
                            className="h-9 px-2 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                        >
                            <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span className="truncate">{cancellingReturnId === orderId ? "Đang hủy..." : "Hủy yêu cầu hoàn trả"}</span>
                        </button>
                    )}

                    {/* Yêu cầu hoàn trả — only if completed/shipping within 7 days */}
                    {canReturn && (
                        <button
                            type="button"
                            onClick={() => onShowReturnModal(order)}
                            className="h-9 px-2 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                        >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Yêu cầu hoàn trả</span>
                        </button>
                    )}

                    {/* Mua lại — for completed, returned, or cancelled */}
                    {canReorder && (
                        <button
                            type="button"
                            onClick={() => onReorder(order)}
                            disabled={reorderingId === orderId}
                            className="h-9 px-3 bg-[#c4a84f] hover:bg-[#a8893a] text-white rounded text-[11px] font-bold tracking-[0.3px] uppercase transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto shadow-sm"
                            title="Thêm các sản phẩm vào giỏ hàng và đặt lại"
                        >
                            {reorderingId === orderId ? (
                                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                            ) : (
                                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span className="truncate">{reorderingId === orderId ? "Đang thêm..." : "Mua lại"}</span>
                        </button>
                    )}

                    {/* Thanh toán ngay — only if unpaid+pending+non-COD */}
                    {hasRepay && (
                        <button
                            type="button"
                            onClick={() => onRepay(order)}
                            disabled={repayingId === orderId}
                            className="h-9 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto"
                        >
                            {repayingId === orderId ? (
                                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                            ) : (
                                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span className="truncate">{repayingId === orderId ? "Đang chuyển..." : "Thanh toán ngay"}</span>
                        </button>
                    )}

                    {/* Hủy đơn — only if pending */}
                    {hasCancel && (
                        <button
                            type="button"
                            onClick={() => onCancelOrderModal(order)}
                            disabled={cancellingId === orderId}
                            className="h-9 px-2 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center w-full md:w-auto"
                        >
                            <span className="truncate">{cancellingId === orderId ? "Đang hủy..." : "Hủy đơn"}</span>
                        </button>
                    )}

                    {/* Link xem chi tiết */}
                    <Link
                        href={`/orders/${order.publicId}`}
                        className={`h-9 px-3 bg-[#2c1a00] text-white hover:bg-[#c4a84f] rounded text-[11px] font-bold tracking-[0.3px] uppercase transition-all no-underline font-sans flex items-center justify-center gap-1 w-full md:w-auto ${detailColSpan}`}
                    >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
