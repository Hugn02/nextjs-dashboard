"use client";

import React, { useState, useEffect } from "react";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { fetchWithAuth } from "@/src/lib/api-client";
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
    publicId: string;
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
            _id: string;
            id: string;
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

    // Batch Review state (Hybrid Modal - đánh giá cả đơn hàng 1 lần)
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    // batchReviews: map productId -> { rating, comment, selected }
    const [batchReviews, setBatchReviews] = useState<Record<string, { rating: number; comment: string; selected?: boolean }>>({});
    const [submittingBatch, setSubmittingBatch] = useState(false);
    const [batchError, setBatchError] = useState<string | null>(null);

    const formatPrice = (n: number) => {
        return n.toLocaleString("vi-VN") + "₫";
    };

    const fetchMyReviews = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/my`);
            if (res.ok) {
                const data = await res.json();
                setMyReviews(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch my reviews:", err);
        }
    };

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const isSameOrder = (rOrder: any, currentOrder: any) => {
        if (!rOrder || !currentOrder) return false;
        const currentIds = [currentOrder.id, currentOrder._id, currentOrder.publicId].filter(Boolean);
        if (typeof rOrder === "string") {
            return currentIds.includes(rOrder);
        }
        if (typeof rOrder === "object") {
            const rIds = [rOrder.id, rOrder._id, rOrder.publicId].filter(Boolean);
            return rIds.some((rId) => currentIds.includes(rId));
        }
        return false;
    };

    const checkIsReviewed = (productId: string) => {
        if (!order) return false;
        return myReviews.some((r) => {
            const matchProduct =
                r.product?.id === productId ||
                r.product?._id === productId ||
                (typeof r.product === "string" && r.product === productId);
            return matchProduct && isSameOrder(r.order, order);
        });
    };

    const getReviewInfo = (productId: string) => {
        if (!order) return null;
        return myReviews.find((r) => {
            const matchProduct =
                r.product?.id === productId ||
                r.product?._id === productId ||
                (typeof r.product === "string" && r.product === productId);
            return matchProduct && isSameOrder(r.order, order);
        }) || null;
    };

    // Kiểm tra tất cả sản phẩm trong đơn đã được đánh giá hết chưa
    const allReviewed = order?.items.every((item) =>
        checkIsReviewed(item.product?.id || item.product?._id)
    ) ?? false;

    // Mở Batch Modal và khởi tạo state rating mặc định 5 sao & selected=true cho từng sản phẩm chưa đánh giá
    const handleOpenBatchModal = () => {
        if (!order) return;
        const initial: Record<string, { rating: number; comment: string; selected: boolean }> = {};
        order.items.forEach((item) => {
            const pid = item.product?.id || item.product?._id;
            if (pid && !checkIsReviewed(pid)) {
                initial[pid] = { rating: 5, comment: "", selected: true };
            }
        });
        setBatchReviews(initial);
        setBatchError(null);
        setShowBatchModal(true);
    };

    const handleBatchSubmit = async () => {
        if (!order || !id) return;

        // Chỉ lọc các sản phẩm được tích chọn (selected === true)
        const selectedEntries = Object.entries(batchReviews).filter(
            ([_, val]) => val.selected
        );

        if (selectedEntries.length === 0) {
            setBatchError("Vui lòng chọn ít nhất 1 sản phẩm để gửi đánh giá.");
            return;
        }

        setSubmittingBatch(true);
        setBatchError(null);

        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: id,
                    reviews: selectedEntries.map(([productId, { rating, comment }]) => ({
                        productId,
                        rating,
                        comment: comment.trim() || `Đánh giá ${rating} sao`,
                    })),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gửi đánh giá thất bại.");
            }

            setShowBatchModal(false);
            await fetchMyReviews();
        } catch (err: any) {
            setBatchError(err.message || "Đã xảy ra lỗi.");
        } finally {
            setSubmittingBatch(false);
        }
    };

    const STAR_LABELS: Record<number, string> = {
        5: "Cực kỳ hài lòng",
        4: "Hài lòng",
        3: "Bình thường",
        2: "Không hài lòng",
        1: "Rất không hài lòng",
    };

    const fetchOrder = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/${id}`);

            if (!res.ok) {
                throw new Error("Không thể tải thông tin đơn hàng.");
            }
            const data = await res.json();
            setOrder(data.data);
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
            const response = await fetchWithAuth(`${API_URL}/orders/${id}/cancel`, {
                method: 'PATCH',
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


    // Helper rendering the timeline stepper - redesigned for mobile-first
    const renderTimeline = () => {
        if (!order) return null;

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
                                Vào lúc: {new Date(order.updatedAt).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 font-sans mt-4 leading-relaxed border-t border-red-100 pt-3">
                        Đơn hàng của bạn đã được hủy bỏ. Nếu bạn đã chuyển khoản trước đó, chúng tôi sẽ liên hệ trong vòng 24h để hoàn tất thủ tục hoàn tiền.
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

        const currentIdx = steps.findIndex(s => s.key === order.status);

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
                                            <div className="w-[2px] flex-1 my-1 min-h-[24px]"
                                                style={{ background: idx < currentIdx ? "#c4a84f" : "#e5e7eb" }}
                                            />
                                        )}
                                    </div>

                                    {/* Right: label */}
                                    <div className={`flex items-start pt-2 pb-5 flex-1 min-w-[130px] ${isLast ? "pb-0" : ""}`}>
                                        <div>
                                            <p className={`text-sm font-bold tracking-[0.3px] font-sans leading-tight ${isCompleted ? "text-[#2c1a00]" : "text-gray-400"
                                                }`}>
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
                                    <p className={`text-xs font-bold tracking-[0.5px] uppercase font-sans ${isCompleted ? "text-[#2c1a00]" : "text-gray-400"
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
                            {/* Title Block - Left & Right layout on mobile & desktop */}
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[#c4a84f] text-[10px] sm:text-xs font-bold tracking-[1.5px] uppercase mb-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Mã đơn hàng</span>
                                    </div>
                                    <h1 className="text-lg sm:text-2xl md:text-3xl font-mono font-bold text-[#2c1a00] break-all leading-tight">
                                        {order.publicId}
                                    </h1>
                                </div>
                                <div className="text-right font-sans text-xs text-gray-400 flex-shrink-0">
                                    <div className="flex items-center justify-end gap-1.5 mb-1">
                                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                        <span>Thời gian đặt hàng:</span>
                                    </div>
                                    <strong className="text-gray-700 text-xs sm:text-sm font-sans block">
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </strong>
                                </div>
                            </div>

                            {/* Visual Progress Stepper */}
                            {renderTimeline()}

                            {/* Two Column details grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                                {/* Left Column: Order Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-[#ede0c4] rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c1a00] font-sans">
                                                Danh sách sản phẩm ({order.items.length})
                                            </h3>
                                        </div>

                                        <div className="divide-y divide-gray-100 px-4 sm:px-6">
                                            {order.items.map((item, idx) => {
                                                const p = item.product || {};
                                                const imgUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                                                return (
                                                    <div key={idx} className="py-4 flex gap-3 sm:gap-4 items-start sm:items-center">
                                                        {/* Image */}
                                                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white border border-[#ede0c4] rounded overflow-hidden flex-shrink-0 mt-0.5 sm:mt-0">
                                                            <ImageWithFallback
                                                                src={imgUrl}
                                                                alt={p.productName || "Sản phẩm"}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-[13px] font-bold text-[#2c1a00] hover:text-[#c4a84f] transition-colors font-sans leading-snug">
                                                                <Link href={`/products/${p.slug}`} className="no-underline text-inherit cursor-pointer line-clamp-2">
                                                                    {p.productName || "Sản phẩm Bát Tràng"}
                                                                </Link>
                                                            </h4>
                                                            {p.sku && (
                                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                                                                    Mã SP: {p.sku}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between mt-1.5 gap-2">
                                                                <p className="text-xs text-gray-400 font-sans">
                                                                    SL: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                                                                    <span className="mx-1.5 text-gray-300">·</span>
                                                                    <span className="text-gray-400">{formatPrice(item.price)}</span>
                                                                </p>
                                                                <span className="text-sm font-bold text-gray-800 font-sans whitespace-nowrap">
                                                                    {formatPrice(item.price * item.quantity)}
                                                                </span>
                                                            </div>
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

                                            {/* Note */}
                                            {order.note && (
                                                <div className="flex gap-3 border-t border-gray-100 pt-3">
                                                    <MessageSquare className="w-5 h-5 text-[#c4a84f] flex-shrink-0" />
                                                    <div className="w-full">
                                                        <span className="text-xs text-gray-400 block">Ghi chú giao nhận</span>
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

                                            {order.status === 'completed' && (
                                                <div className="space-y-3 border-b border-gray-100 pb-3">
                                                    {allReviewed ? (
                                                        <div className="flex items-center gap-2 py-2 px-3 bg-green-50 border border-green-200 rounded">
                                                            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            <div>
                                                                <p className="text-xs font-bold text-green-700 font-sans">Đã đánh giá đơn hàng</p>
                                                                <p className="text-[10px] text-green-600 font-sans mt-0.5">Cảm ơn bạn đã chia sẻ đánh giá!</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={handleOpenBatchModal}
                                                            className="w-full flex items-center justify-center gap-2 bg-[#c4a84f] text-white hover:bg-[#a8893a] text-xs font-bold tracking-[1.5px] uppercase py-3.5 rounded transition-all font-sans cursor-pointer border-none shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                            Đánh giá đơn hàng
                                                        </button>
                                                    )}
                                                </div>
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
                                {order?.publicId}
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
            {/* Batch Review Modal (Hybrid - Đánh giá tất cả sản phẩm trong 1 Modal) */}
            {showBatchModal && order && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 md:p-6 pt-28 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-[#ede0c4] overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
                            <div>
                                <h3 className="text-base font-bold text-[#2c1a00] uppercase tracking-[1px] font-sans">Đánh giá đơn hàng</h3>
                                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Mã đơn: <span className="font-mono text-[#c4a84f]">{order.publicId}</span></p>
                            </div>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 bg-transparent border-none rounded-full cursor-pointer text-lg leading-none transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Scrollable product list */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 font-sans">
                            {(() => {
                                const reviewableItemsCount = order.items.filter(item => {
                                    const pid = item.product?.id || item.product?._id;
                                    return pid && !checkIsReviewed(pid);
                                }).length;

                                return order.items.map((item, idx) => {
                                    const p = item.product;
                                    const pid = p?.id || p?._id || "";
                                    const imgUrl = p?.imageUrl?.[0] || "https://placehold.co/64x64";
                                    const alreadyReviewed = checkIsReviewed(pid);
                                    const reviewInfo = alreadyReviewed ? getReviewInfo(pid) : null;
                                    const entry = batchReviews[pid];
                                    const isSelected = entry?.selected ?? false;

                                    return (
                                        <div
                                            key={idx}
                                            className={`rounded-xl border p-4 transition-all ${alreadyReviewed
                                                ? "bg-green-50/60 border-green-200"
                                                : isSelected
                                                    ? "bg-white border-[#ede0c4] shadow-sm"
                                                    : "bg-gray-50/70 border-dashed border-gray-300 opacity-60"
                                                }`}
                                        >
                                            {/* Product info row & Checkbox */}
                                            <div className="flex gap-3 items-center mb-3">
                                                {!alreadyReviewed && entry && reviewableItemsCount > 1 && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) =>
                                                            setBatchReviews((prev) => ({
                                                                ...prev,
                                                                [pid]: { ...prev[pid], selected: e.target.checked },
                                                            }))
                                                        }
                                                        title="Tích chọn để đánh giá sản phẩm này"
                                                        className="w-5 h-5 accent-[#c4a84f] rounded cursor-pointer flex-shrink-0"
                                                    />
                                                )}
                                                <div className="relative w-14 h-14 flex-shrink-0 border border-[#ede0c4] rounded-lg overflow-hidden bg-[#faf7f2]">
                                                    <ImageWithFallback src={imgUrl} alt={p?.productName || "Sản phẩm"} fill className="object-cover" sizes="56px" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#2c1a00] line-clamp-2 leading-snug">{p?.productName || "Sản phẩm"}</p>
                                                    {p?.sku && <span className="text-[10px] font-mono text-gray-400">SKU: {p.sku}</span>}
                                                </div>
                                                {alreadyReviewed ? (
                                                    <div className="flex-shrink-0 flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                        Đã đánh giá
                                                    </div>
                                                ) : (
                                                    <span className={`text-[11px] font-semibold ${isSelected ? "text-[#c4a84f]" : "text-gray-400"}`}>
                                                        {isSelected ? "Bật đánh giá" : "Bỏ qua lần này"}
                                                    </span>
                                                )}
                                            </div>

                                            {alreadyReviewed && reviewInfo ? (
                                                /* Hiển thị đánh giá đã gửi */
                                                <div className="bg-white rounded-lg border border-green-200 p-3 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-amber-500 text-sm tracking-widest">{"\u2605".repeat(reviewInfo.rating)}{"\u2606".repeat(5 - reviewInfo.rating)}</span>
                                                        <span className="text-xs text-gray-400 font-sans">{STAR_LABELS[reviewInfo.rating]}</span>
                                                    </div>
                                                    {reviewInfo.comment && (
                                                        <p className="text-xs text-gray-600 italic leading-relaxed">&ldquo;{reviewInfo.comment}&rdquo;</p>
                                                    )}
                                                </div>
                                            ) : entry && isSelected ? (
                                                /* Form đánh giá khi được tích chọn */
                                                <div className="space-y-3 pt-1 border-t border-gray-100">
                                                    {/* Star Picker */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Mức độ hài lòng</label>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setBatchReviews((prev) => ({
                                                                            ...prev,
                                                                            [pid]: { ...prev[pid], rating: star },
                                                                        }))
                                                                    }
                                                                    className={`text-2xl transition-all cursor-pointer bg-transparent border-none p-0.5 leading-none ${star <= entry.rating
                                                                        ? "text-amber-500 scale-110"
                                                                        : "text-gray-300 hover:text-amber-400"
                                                                        }`}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                            <span className="text-xs font-semibold text-[#c4a84f] ml-2">{STAR_LABELS[entry.rating]}</span>
                                                        </div>
                                                    </div>

                                                    {/* Comment */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nhận xét <span className="text-gray-300 font-normal normal-case">(tùy chọn)</span></label>
                                                        <textarea
                                                            value={entry.comment}
                                                            onChange={(e) =>
                                                                setBatchReviews((prev) => ({
                                                                    ...prev,
                                                                    [pid]: { ...prev[pid], comment: e.target.value },
                                                                }))
                                                            }
                                                            placeholder={`Chia sẻ cảm nhận của bạn về ${p?.productName}...`}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#c4a84f] focus:ring-2 focus:ring-[#c4a84f]/20 focus:outline-none text-sm font-sans resize-none transition"
                                                        />
                                                    </div>
                                                </div>
                                            ) : entry && !isSelected ? (
                                                <p className="text-xs text-gray-400 italic m-0 pt-1">Tích chọn ở góc trái nếu muốn gửi đánh giá cho sản phẩm này.</p>
                                            ) : null}
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 bg-[#fbfaf8] border-t border-[#ede0c4] px-5 py-4">
                            {batchError && (
                                <p className="text-xs text-red-500 font-semibold font-sans mb-3">{batchError}</p>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchModal(false)}
                                    disabled={submittingBatch}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold tracking-[1px] uppercase rounded-lg hover:bg-gray-50 transition font-sans cursor-pointer disabled:opacity-50"
                                >
                                    Đóng
                                </button>
                                {!allReviewed && (
                                    <button
                                        type="button"
                                        onClick={handleBatchSubmit}
                                        disabled={submittingBatch || Object.values(batchReviews).filter((r) => r.selected).length === 0}
                                        className="px-6 py-2.5 bg-[#c4a84f] hover:bg-[#a8893a] text-white text-xs font-bold tracking-[1.5px] uppercase rounded-lg transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed font-sans cursor-pointer flex items-center gap-2"
                                    >
                                        {submittingBatch ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                Gửi {Object.values(batchReviews).filter((r) => r.selected).length} đánh giá
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
