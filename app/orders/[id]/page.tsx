"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import {
    ArrowLeft,
    Calendar,
    FileText,
    Phone,
    User,
    MapPin,
    MessageSquare,
    CreditCard,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    HelpCircle
} from "lucide-react";

interface OrderDetail {
    _id: string;
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note?: string;
    total: number;
    shippingFee: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{
        product: {
            productName: string;
            imageUrl: string[];
            slug: string;
            sku?: string;
        };
        quantity: number;
        price: number;
    }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const formatPrice = (n: number) => {
        return n.toLocaleString("vi-VN") + "₫";
    };

    const fetchOrder = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/orders/${id}`, {
                headers,
            });

            if (!res.ok) {
                throw new Error("Không thể tải thông tin đơn hàng.");
            }
            const data = await res.json();
            setOrder(data);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!id) return;
        setCancelling(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Bạn cần đăng nhập để thực hiện hành động này.");
            }

            const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Hủy đơn hàng thất bại.");
            }

            // Reload order details
            await fetchOrder();
            setShowCancelModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCancelling(false);
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pending: "Chờ xác nhận",
            confirmed: "Đã xác nhận",
            shipping: "Đang vận chuyển",
            completed: "Hoàn thành",
            cancelled: "Đã hủy",
        };
        return statusMap[status] || status;
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

    // Calculate subtotal (excluding shipping fee)
    const getSubtotal = () => {
        if (!order) return 0;
        return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    // Helper rendering the timeline stepper
    const renderTimeline = () => {
        if (!order) return null;

        const isCancelled = order.status === "cancelled";

        if (isCancelled) {
            return (
                <div className="bg-white border border-red-200 rounded-lg p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-200 text-red-600 flex-shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-650 font-sans">Đơn hàng đã bị hủy</h3>
                            <p className="text-xs text-gray-400 font-sans mt-0.5">Vào lúc: {new Date(order.updatedAt).toLocaleString("vi-VN")}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 font-sans max-w-md">
                        Đơn hàng của bạn đã được hủy bỏ. Nếu bạn đã chuyển khoản trước đó, chúng tôi sẽ liên hệ trong vòng 24h để hoàn tất thủ tục hoàn tiền.
                    </div>
                </div>
            );
        }

        const steps = [
            { key: "pending", label: "Chờ xác nhận", icon: Clock },
            { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2 },
            { key: "shipping", label: "Đang vận chuyển", icon: Truck },
            { key: "completed", label: "Hoàn thành", icon: CheckCircle2 },
        ];

        // Determine current step index
        const currentIdx = steps.findIndex(s => s.key === order.status);

        return (
            <div className="bg-white border border-[#ede0c4] rounded-lg p-6 md:p-8 mb-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 font-sans text-center md:text-left">
                    Trạng thái đơn hàng
                </h3>

                <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 md:gap-4 font-sans">
                    {/* Horizontal Line connector (Desktop only) */}
                    <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-gray-100 z-0">
                        <div
                            className="h-full bg-[#c4a84f] transition-all duration-500"
                            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx <= currentIdx;
                        const isActive = idx === currentIdx;

                        return (
                            <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 z-10 w-full md:w-auto">
                                {/* Dot step */}
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isCompleted
                                        ? "bg-[#c4a84f] border-[#c4a84f] text-white shadow-md shadow-[#c4a84f]/20"
                                        : "bg-white border-gray-200 text-gray-400"
                                        } ${isActive ? "ring-4 ring-[#c4a84f]/20 scale-110" : ""}`}
                                >
                                    <StepIcon className="w-5 h-5" />
                                </div>

                                {/* Label step */}
                                <div className="text-left md:text-center">
                                    <p className={`text-xs font-bold tracking-[0.5px] uppercase ${isCompleted ? "text-[#2c1a00]" : "text-gray-400"
                                        }`}>
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
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto mt-8 md:mt-12">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/orders/history"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c4a84f] text-xs font-bold tracking-[1px] uppercase transition-colors no-underline font-sans"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại lịch sử đơn hàng
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 bg-white border border-[#ede0c4] rounded-lg shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#c4a84f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-sm text-gray-500 font-sans">Đang tải chi tiết đơn hàng...</p>
                        </div>
                    ) : error || !order ? (
                        <div className="bg-white border border-[#ede0c4] rounded-lg p-16 text-center shadow-sm max-w-lg mx-auto">
                            <HelpCircle className="w-16 h-16 text-[#c4a84f] mx-auto mb-4 stroke-1" />
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] mb-2">Không tìm thấy đơn hàng</h3>
                            <p className="text-gray-500 text-sm mb-6 font-sans">{error || "Mã đơn hàng không hợp lệ hoặc đã bị xóa khỏi hệ thống."}</p>
                            <Link
                                href="/orders/history"
                                className="inline-block bg-[#c4a84f] text-white px-8 py-3 rounded text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] hover:bg-[#a8893a] transition-all no-underline"
                            >
                                Quay về lịch sử đơn hàng
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {/* Title Block */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 text-[#c4a84f] text-xs font-bold tracking-[2px] uppercase mb-1">
                                        <FileText className="w-4 h-4" />
                                        <span>Mã đơn hàng</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-mono font-bold text-[#2c1a00] break-all">
                                        {order._id}
                                    </h1>
                                </div>
                                <div className="text-left md:text-right font-sans text-xs text-gray-400">
                                    <div className="flex items-center md:justify-end gap-1.5 mb-1">
                                        <Calendar className="w-4 h-4 text-gray-300" />
                                        <span>Thời gian đặt hàng:</span>
                                    </div>
                                    <strong className="text-gray-700 text-sm font-sans">
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </strong>
                                </div>
                            </div>

                            {/* Visual Progress Stepper */}
                            {renderTimeline()}

                            {/* Two Column details grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Left Column: Order Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] font-sans">
                                                Danh sách sản phẩm ({order.items.length})
                                            </h3>
                                        </div>

                                        <div className="divide-y divide-gray-100 px-6">
                                            {order.items.map((item, idx) => {
                                                const p = item.product || {};
                                                const imgUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                                                return (
                                                    <div key={idx} className="py-5 flex gap-4 items-center">
                                                        <div className="relative w-16 h-16 bg-white border border-[#ede0c4] rounded overflow-hidden flex-shrink-0">
                                                            <Image
                                                                src={imgUrl}
                                                                alt={p.productName || "Sản phẩm"}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-[#2c1a00] hover:text-[#c4a84f] transition-colors font-sans">
                                                                <Link href={`/products/${p.slug}`} className="no-underline text-inherit cursor-pointer">
                                                                    {p.productName || "Sản phẩm Bát Tràng"}
                                                                </Link>
                                                            </h4>
                                                            {p.sku && (
                                                                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                                                    Mã SP: {p.sku}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1 font-sans">
                                                                Số lượng: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 font-sans font-medium mb-0.5">Đơn giá: {formatPrice(item.price)}</p>
                                                            <span className="text-sm font-bold text-gray-800 font-sans">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Cost breakdown Card */}
                                    <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm p-6 space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] border-b border-[#ede0c4] pb-2 font-sans">
                                            Chi tiết hóa đơn
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-500 font-sans">
                                            <div className="flex justify-between">
                                                <span>Tạm tính:</span>
                                                <span className="text-gray-800 font-medium">{formatPrice(getSubtotal())}</span>
                                            </div>
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
                                                <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {getPaymentStatusText(order.paymentStatus)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-[#ede0c4] pt-4 font-sans">
                                            <span className="text-sm font-bold uppercase text-[#2c1a00] tracking-wider">Tổng thanh toán:</span>
                                            <span className="text-2xl font-extrabold text-[#8b2500]">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Delivery Information & Actions */}
                                <div className="space-y-6">
                                    {/* Delivery Info Card */}
                                    <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm p-6 space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] border-b border-[#ede0c4] pb-2 font-sans">
                                            Thông tin giao hàng
                                        </h3>
                                        <div className="space-y-4 font-sans text-sm text-gray-700">
                                            {/* Customer Name */}
                                            <div className="flex gap-3">
                                                <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-450 block">Khách nhận hàng</span>
                                                    <span className="font-semibold text-gray-800">{order.customerName}</span>
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="flex gap-3">
                                                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-450 block">Số điện thoại</span>
                                                    <span className="font-semibold text-gray-800">{order.phone}</span>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="flex gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-450 block">Địa chỉ nhận hàng</span>
                                                    <span className="font-semibold text-gray-750 leading-relaxed">
                                                        {order.address}, {order.ward}, {order.district}, {order.province}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Note */}
                                            {order.note && (
                                                <div className="flex gap-3 border-t border-gray-100 pt-3">
                                                    <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    <div className="w-full">
                                                        <span className="text-xs text-gray-450 block">Ghi chú giao nhận</span>
                                                        <p className="text-xs italic text-gray-500 bg-[#fbfaf8] border border-gray-200 rounded p-2.5 mt-1 leading-normal">
                                                            "{order.note}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Box Card */}
                                    <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm p-6 space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] border-b border-[#ede0c4] pb-2 font-sans">
                                            Hành động đơn hàng
                                        </h3>

                                        <div className="flex flex-col gap-3">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => setShowCancelModal(true)}
                                                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold tracking-[1px] uppercase py-3.5 rounded transition-all font-sans cursor-pointer"
                                                >
                                                    Hủy đơn hàng này
                                                </button>
                                            )}

                                            <Link
                                                href="/products/all"
                                                className="w-full bg-[#2c1a00] text-white hover:bg-[#c4a84f] text-xs font-bold tracking-[1.5px] uppercase py-3.5 rounded transition-all text-center no-underline font-sans cursor-pointer"
                                            >
                                                Tiếp tục mua sắm
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Cancel Order Confirm Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">Xác nhận hủy đơn hàng</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 font-sans leading-relaxed">
                                Bạn có chắc chắn muốn hủy đơn hàng này không?
                            </p>
                            <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-700 break-all">
                                {order?._id}
                            </div>
                            <p className="text-xs text-red-500 font-sans font-medium">
                                * Lưu ý: Hành động hủy đơn hàng sẽ không thể khôi phục sau khi hoàn tất.
                            </p>
                        </div>
                        <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="px-5 py-2.5 bg-gray-150 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition font-sans cursor-pointer"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-sans cursor-pointer"
                            >
                                {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
