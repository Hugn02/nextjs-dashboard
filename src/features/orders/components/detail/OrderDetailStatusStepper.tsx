"use client";

import React from "react";
import {
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    RotateCcw,
    Package,
} from "lucide-react";
import { OrderDetail } from "../../types";

interface OrderDetailStatusStepperProps {
    order: OrderDetail;
}

export default function OrderDetailStatusStepper({ order }: OrderDetailStatusStepperProps) {
    const isCancelled = order.status === "cancelled";

    if (isCancelled) {
        return (
            <div className="bg-white border border-red-200 rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center border border-red-200 text-red-600 flex-shrink-0">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-600 font-sans text-sm">Đơn hàng đã bị hủy</h3>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">
                            Vào lúc: {new Date(order.updatedAt || order.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-sans mt-4 leading-relaxed border-t border-red-100 pt-3">
                    Đơn hàng của bạn đã được hủy bỏ. Nếu bạn đã chuyển khoản trước đó, chúng tôi sẽ liên hệ trong vòng 24h để hoàn tất thủ tục hoàn tiền.
                </p>
            </div>
        );
    }

    if (order.status === "return_requested") {
        return (
            <div className="bg-white border border-orange-200 rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center border border-orange-200 text-orange-600 flex-shrink-0">
                        <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-700 font-sans text-sm">Đang yêu cầu hoàn trả đơn hàng</h3>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">
                            Cập nhật: {new Date(order.updatedAt || order.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-sans mt-4 leading-relaxed border-t border-orange-100 pt-3">
                    Yêu cầu hoàn trả và thông tin nhận hoàn tiền của bạn đang được tiếp nhận xử lý. Bạn có thể nhấn nút &ldquo;Xem Yêu cầu Hoàn trả&rdquo; ở bên dưới để theo dõi chi tiết.
                </p>
            </div>
        );
    }

    if (order.status === "returned") {
        return (
            <div className="bg-white border border-teal-200 rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-teal-50 rounded-full flex items-center justify-center border border-teal-200 text-teal-700 flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-teal-800 font-sans text-sm">Đơn hàng đã hoàn trả &amp; hoàn tiền thành công</h3>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">
                            Hoàn tất: {new Date(order.updatedAt || order.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-sans mt-4 leading-relaxed border-t border-teal-100 pt-3">
                    Đơn hàng đã được xác nhận hoàn trả và hoàn tiền thành công theo thông tin bạn đã cung cấp.
                </p>
            </div>
        );
    }

    const steps = [
        { key: "pending", label: "Chờ xác nhận", icon: Clock },
        { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
        { key: "shipping", label: "Đang vận chuyển", icon: Truck },
        { key: "completed", label: "Hoàn thành", icon: CheckCircle2 },
    ];

    const currentIdx = steps.findIndex((s) => s.key === order.status);

    return (
        <div className="bg-white border border-[#ede0c4] rounded-lg p-5 md:p-8 mb-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5 font-sans text-center">
                Trạng thái đơn hàng
            </h3>

            {/* ── MOBILE: Vertical Stepper ── */}
            <div className="flex md:hidden flex-col items-center">
                <div className="w-fit mx-auto flex flex-col">
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx <= currentIdx;
                        const isActive = idx === currentIdx;
                        const isLast = idx === steps.length - 1;

                        return (
                            <div key={step.key} className="flex gap-4 items-stretch">
                                {/* Left: icon + vertical line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${isCompleted
                                            ? "bg-[#c4a84f] border-[#c4a84f] text-white shadow-md shadow-[#c4a84f]/20"
                                            : "bg-white border-gray-200 text-gray-400"
                                            } ${isActive ? "ring-4 ring-[#c4a84f]/20 scale-110" : ""}`}
                                    >
                                        <StepIcon className="w-4 h-4" />
                                    </div>
                                    {/* Vertical connector */}
                                    {!isLast && (
                                        <div
                                            className="w-[2px] flex-1 my-1 min-h-[24px]"
                                            style={{ background: idx < currentIdx ? "#c4a84f" : "#e5e7eb" }}
                                        />
                                    )}
                                </div>

                                {/* Right: label */}
                                <div className={`flex items-start pt-2 pb-5 flex-1 min-w-[130px] ${isLast ? "pb-0" : ""}`}>
                                    <div>
                                        <p
                                            className={`text-sm font-bold tracking-[0.3px] font-sans leading-tight ${isCompleted ? "text-[#2c1a00]" : "text-gray-400"
                                                }`}
                                        >
                                            {step.label}
                                        </p>
                                        {isActive && (
                                            <span className="inline-block px-2 py-0.5 mt-1 bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] rounded text-[10px] font-semibold font-sans">
                                                Hiện tại
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── DESKTOP: Horizontal Stepper ── */}
            <div className="hidden md:flex justify-between items-start relative gap-4 font-sans">
                {/* Horizontal Line */}
                <div className="absolute top-[20px] left-[10%] right-[10%] h-[2px] bg-gray-100 z-0">
                    <div
                        className="h-full bg-[#c4a84f] transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1 z-10">
                            <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                    ? "bg-[#c4a84f] border-[#c4a84f] text-white shadow-md shadow-[#c4a84f]/20"
                                    : "bg-white border-gray-200 text-gray-400"
                                    } ${isActive ? "ring-4 ring-[#c4a84f]/20 scale-110" : ""}`}
                            >
                                <StepIcon className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                                <p
                                    className={`text-xs font-bold tracking-[0.5px] uppercase font-sans ${isCompleted ? "text-[#2c1a00]" : "text-gray-400"
                                        }`}
                                >
                                    {step.label}
                                </p>
                                {isActive && (
                                    <span className="inline-block px-2 py-0.5 mt-1 bg-[#fffbeb] border border-[#fef3c7] text-[#d97706] rounded text-[10px] font-semibold">
                                        Hiện tại
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── STATUS PROGRESS BANNER ── */}
            {order.status === "confirmed" && (
                <div className="mt-6 pt-5 border-t border-[#f3ede2] flex items-start gap-3.5 bg-[#fdfcf9] p-4 rounded-lg border border-[#ede0c4]/80">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                    </div>
                    <div className="font-sans flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider">Đang chuẩn bị hàng</h4>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">Xưởng Bát Tràng</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Đơn hàng đã được xác nhận. Xưởng gốm Bát Tràng đang kiểm tra kỹ lưỡng và đóng gói sản phẩm để bàn giao cho đơn vị vận chuyển.
                        </p>
                    </div>
                </div>
            )}

            {order.status === "shipping" && (
                <div
                    className={`mt-6 pt-5 border-t border-[#f3ede2] flex items-start gap-3.5 p-4 rounded-lg border transition-all ${order.shippingStatus === "delivered"
                        ? "bg-[#f4fbf7] border-emerald-300 shadow-xs"
                        : order.shippingStatus === "cancelled"
                            ? "bg-rose-50/80 border-rose-200"
                            : "bg-[#f8fbff] border-blue-200/70"
                        }`}
                >
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${order.shippingStatus === "delivered"
                            ? "bg-emerald-100 border border-emerald-300 text-emerald-700"
                            : order.shippingStatus === "cancelled"
                                ? "bg-rose-100 border border-rose-300 text-rose-700"
                                : "bg-blue-50 border border-blue-200 text-blue-600"
                            }`}
                    >
                        {order.shippingStatus === "delivered" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : order.shippingStatus === "cancelled" ? (
                            <XCircle className="w-5 h-5 text-rose-600" />
                        ) : (
                            <Truck className="w-4 h-4" />
                        )}
                    </div>
                    <div className="font-sans flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4
                                className={`text-xs font-bold uppercase tracking-wider ${order.shippingStatus === "delivered"
                                    ? "text-emerald-900"
                                    : order.shippingStatus === "cancelled"
                                        ? "text-rose-900"
                                        : "text-blue-900"
                                    }`}
                            >
                                {order.shippingStatus === "delivered"
                                    ? "Shipper đã giao kiện hàng đến bạn"
                                    : order.shippingStatus === "cancelled"
                                        ? "Đơn vị vận chuyển đã hủy vận đơn"
                                        : "Đang vận chuyển"}
                            </h4>
                            {(order.shippingProviderName || order.shippingProvider) && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                                    {order.shippingProviderName || order.shippingProvider}
                                </span>
                            )}
                            {order.trackingCode && (
                                <span className="text-xs font-mono font-bold bg-white text-blue-900 border border-blue-200 px-2 py-0.5 rounded select-all">
                                    Mã vận đơn: {order.trackingCode}
                                </span>
                            )}
                            {order.shippingStatus === "delivered" && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Giao hàng thành công
                                </span>
                            )}
                            {order.shippingStatus === "cancelled" && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    Hãng đã hủy mã
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                            {order.shippingStatus === "delivered"
                                ? 'Nhân viên giao hàng đã báo giao kiện hàng thành công. Quý khách vui lòng kiểm tra kỹ sản phẩm gốm sứ và bấm nút "Đã nhận được hàng" bên dưới để hoàn tất nghiệm thu.'
                                : order.shippingStatus === "cancelled"
                                    ? "Mã vận chuyển này đã bị hủy trên cổng của hãng vận chuyển. Cửa hàng đang tiến hành kiểm tra và gửi lại kiện hàng mới cho bạn."
                                    : 'Đơn hàng đang trên đường giao đến bạn. Quý khách vui lòng chú ý điện thoại từ nhân viên giao hàng (Shipper). Nút xác nhận nhận hàng sẽ khả dụng sau khi shipper giao hàng thành công.'}
                        </p>
                        {order.shippingDetail && (
                            <div className="mt-2 text-[11px] text-blue-800 font-medium bg-blue-50/80 px-2.5 py-1.5 rounded border border-blue-200/60 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                <span>Tiến độ bưu cục: {order.shippingDetail}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {order.status === "pending" && (
                <div className="mt-6 pt-5 border-t border-[#f3ede2] flex items-start gap-3.5 bg-[#fdfcf9] p-4 rounded-lg border border-[#ede0c4]/80">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div className="font-sans flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#2c1a00] uppercase tracking-wider">Chờ xác nhận đơn hàng</h4>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Đơn hàng của bạn đã được ghi nhận. Bộ phận chăm sóc khách hàng của Gốm sứ Bát Tràng sẽ sớm kiểm tra và xác nhận đơn hàng.
                        </p>
                    </div>
                </div>
            )}

            {order.status === "completed" && (
                <div className="mt-6 pt-5 border-t border-[#f3ede2] flex items-start gap-3.5 bg-[#f6fcf8] p-4 rounded-lg border border-emerald-200/80">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="font-sans flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Giao hàng thành công</h4>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Đã hoàn tất</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Đơn hàng đã được giao thành công. Cảm ơn quý khách đã tin chọn sản phẩm thủ công từ làng nghề Gốm Sứ Bát Tràng!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
