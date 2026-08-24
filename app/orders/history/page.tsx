"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { User } from "@/src/features/auth/types/auth.types";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/src/lib/api-client";
import {
    ShoppingBag,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    RotateCcw,
} from "lucide-react";
import ReturnRequestModal from "@/src/components/ReturnRequestModal";

interface Order {
    _id?: string;
    id?: string;
    publicId: string;
    total: number;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    createdAt: string;
    items: Array<{
        product: {
            productName: string;
            imageUrl?: string[];
        };
        quantity: number;
        price: number;
    }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const TABS = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xác nhận" },
    { id: "confirmed", label: "Đã xác nhận" },
    { id: "shipping", label: "Đang giao" },
    { id: "completed", label: "Hoàn thành" },
    { id: "return_requested", label: "Yêu cầu hoàn trả" },
    { id: "returned", label: "Đã hoàn trả" },
    { id: "cancelled", label: "Đã hủy" },
];

export default function OrderHistoryPage() {
    const { user: authUser, token } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const tabsScrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [repayingId, setRepayingId] = useState<string | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<Order | null>(null);
    const [showReturnModal, setShowReturnModal] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    const handleDownloadInvoice = async (order: Order) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setDownloadingInvoiceId(orderId);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/${orderId}/invoice`);
            if (!res.ok) {
                throw new Error('Không thể lấy dữ liệu hóa đơn.');
            }
            const data = await res.json();
            const invoiceData = data.data || data;

            const { downloadOrderInvoicePdf } = await import('@/src/lib/downloadOrderInvoicePdf');
            await downloadOrderInvoicePdf(invoiceData);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi tải hóa đơn PDF.');
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const [showCancelReturnModal, setShowCancelReturnModal] = useState<Order | null>(null);
    const [cancelReturnSuccess, setCancelReturnSuccess] = useState<boolean>(false);
    const [cancelReturnError, setCancelReturnError] = useState<string | null>(null);
    const [cancellingReturnId, setCancellingReturnId] = useState<string | null>(null);

    const openCancelReturnModal = (order: Order) => {
        setShowCancelReturnModal(order);
        setCancelReturnSuccess(false);
        setCancelReturnError(null);
    };

    const executeCancelReturnRequest = async (order: Order) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setCancellingReturnId(orderId);
        setCancelReturnError(null);

        try {
            const res = await fetchWithAuth(`${API_URL}/returns/order/${orderId}/cancel`, {
                method: 'POST',
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Không thể hủy yêu cầu hoàn trả.');
            }

            setCancelReturnSuccess(true);
        } catch (err: any) {
            setCancelReturnError(err.message || 'Có lỗi xảy ra khi hủy yêu cầu hoàn trả.');
        } finally {
            setCancellingReturnId(null);
        }
    };

    const handleRepay = async (order: Order) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setRepayingId(orderId);
        try {
            const response = await fetchWithAuth(`${API_URL}/payments/${orderId}/repay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethod: order.paymentMethod || 'vnpay',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Không thể tạo link thanh toán.');
            }

            const data = await response.json();
            const payResult = data.data || data;
            if (payResult?.paymentUrl) {
                window.location.href = payResult.paymentUrl;
            } else {
                alert('Không thể tạo URL thanh toán. Vui lòng thử lại.');
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi tạo thanh toán.');
        } finally {
            setRepayingId(null);
        }
    };

    useEffect(() => {
        if (authUser) {
            setUser(authUser);
        } else if (!token) {
            setLoading(false);
        }
    }, [authUser, token]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetchWithAuth(`${API_URL}/orders/my-orders`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tải lịch sử đơn hàng.");
            }

            const data = await response.json();
            setOrders(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    const handleCancelOrder = async (orderId: string) => {
        setCancellingId(orderId);
        try {
            const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/cancel`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Hủy đơn hàng thất bại.");
            }

            // Cập nhật trạng thái
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: 'cancelled' } : order
                )
            );
            setShowConfirmModal(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    const formatPrice = (n: number) => {
        return n.toLocaleString("vi-VN") + "₫";
    };

    const getStatusConfig = (status: string) => {
        const configs: { [key: string]: { text: string; bg: string; textClass: string; icon: any } } = {
            pending: {
                text: "Chờ xác nhận",
                bg: "bg-[#fffbeb] border-[#fef3c7]",
                textClass: "text-[#d97706]",
                icon: Clock
            },
            confirmed: {
                text: "Đã xác nhận",
                bg: "bg-[#eff6ff] border-[#dbeafe]",
                textClass: "text-[#2563eb]",
                icon: CheckCircle2
            },
            shipping: {
                text: "Đang vận chuyển",
                bg: "bg-[#e0e7ff] border-[#c7d2fe]",
                textClass: "text-[#4f46e5]",
                icon: Truck
            },
            completed: {
                text: "Hoàn thành",
                bg: "bg-[#ecfdf5] border-[#d1fae5]",
                textClass: "text-[#059669]",
                icon: CheckCircle2
            },
            return_requested: {
                text: "Yêu cầu hoàn trả",
                bg: "bg-[#fff7ed] border-[#ffedd5]",
                textClass: "text-[#c2410c]",
                icon: RotateCcw
            },
            returned: {
                text: "Đã hoàn trả/hoàn tiền",
                bg: "bg-[#f1f5f9] border-[#e2e8f0]",
                textClass: "text-[#475569]",
                icon: CheckCircle2
            },
            cancelled: {
                text: "Đã hủy",
                bg: "bg-[#fef2f2] border-[#fee2e2]",
                textClass: "text-[#dc2626]",
                icon: XCircle
            },
        };
        return configs[status] || {
            text: status,
            bg: "bg-[#f8fafc] border-[#f1f5f9]",
            textClass: "text-[#64748b]",
            icon: AlertCircle
        };
    };

    // Lọc đơn hàng theo tab
    const filteredOrders = activeTab === "all"
        ? orders
        : orders.filter(o => o.status === activeTab);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-20 px-4 md:px-8 ">
                <div className="max-w-5xl mx-auto mt-8 md:mt-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="text-[#c4a84f] text-xs font-bold tracking-[4px] uppercase mb-2 block">Tài khoản của bạn</span>
                        <h1 className="text-3xl md:text-4xl font-bold font-['Cormorant_Garamond',_serif] tracking-[2px] text-[#2c1a00] uppercase">
                            Lịch sử đơn hàng
                        </h1>
                        <div className="w-16 h-[2px] bg-[#c4a84f] mx-auto mt-4"></div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 bg-white border border-[#ede0c4] rounded-lg shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#c4a84f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-sm text-gray-500 font-sans">Đang tải lịch sử đơn hàng của bạn...</p>
                        </div>
                    ) : !user ? (
                        <div className="bg-white border border-[#ede0c4] rounded-lg p-10 text-center shadow-sm max-w-lg mx-auto">
                            <ShoppingBag className="w-16 h-16 text-[#c4a84f] mx-auto mb-4 stroke-1" />
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] mb-2">Bạn chưa đăng nhập</h3>
                            <p className="text-gray-500 text-sm mb-6 font-sans">Vui lòng đăng nhập để xem thông tin lịch sử mua hàng của mình.</p>
                            <Link
                                href="/"
                                className="inline-block bg-[#c4a84f] text-white px-8 py-3 rounded text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] hover:bg-[#a8893a] transition-all no-underline"
                            >
                                Quay về trang chủ
                            </Link>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-10 text-center max-w-lg mx-auto shadow-sm">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 stroke-1" />
                            <p className="font-semibold font-sans">Có lỗi xảy ra</p>
                            <p className="text-sm font-sans mt-2">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs filter — scrollable with arrow buttons */}
                            <div className="relative mb-8">
                                {/* Left arrow */}
                                <button
                                    type="button"
                                    onClick={() => tabsScrollRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-[#ede0c4] rounded-full shadow-sm text-[#8b6914] hover:bg-[#fdf8ef] transition-all cursor-pointer"
                                    aria-label="Cuộn trái"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Scrollable tab strip */}
                                <div
                                    ref={tabsScrollRef}
                                    className="flex overflow-x-auto pb-2 border-b border-[#ede0c4] gap-1 no-scrollbar scroll-smooth mx-8"
                                >
                                    {TABS.map((tab) => {
                                        const count = tab.id === "all"
                                            ? orders.length
                                            : orders.filter(o => o.status === tab.id).length;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`px-4 py-2.5 text-xs font-bold tracking-[1px] uppercase whitespace-nowrap border-b-2 transition-all font-sans cursor-pointer flex-shrink-0 ${
                                                    activeTab === tab.id
                                                        ? "border-[#c4a84f] text-[#c4a84f]"
                                                        : "border-transparent text-gray-400 hover:text-[#2c1a00]"
                                                }`}
                                            >
                                                {tab.label}
                                                <span className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                                    activeTab === tab.id
                                                        ? 'bg-[#c4a84f] text-white'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Right arrow */}
                                <button
                                    type="button"
                                    onClick={() => tabsScrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white border border-[#ede0c4] rounded-full shadow-sm text-[#8b6914] hover:bg-[#fdf8ef] transition-all cursor-pointer"
                                    aria-label="Cuộn phải"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Orders list */}
                            {filteredOrders.length === 0 ? (
                                <div className="bg-white border border-[#ede0c4] rounded-lg p-16 text-center shadow-sm">
                                    <ShoppingBag className="w-16 h-16 text-[#c4a84f] mx-auto mb-4 stroke-1" />
                                    <p className="text-gray-500 text-sm mb-6 font-sans">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
                                    <Link
                                        href="/products/all"
                                        className="inline-block bg-[#c4a84f] text-white px-8 py-3.5 rounded text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] hover:bg-[#a8893a] transition-all no-underline"
                                    >
                                        Bắt đầu mua sắm
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredOrders.map((order, idx) => {
                                        const statusCfg = getStatusConfig(order.status);
                                        const StatusIcon = statusCfg.icon;
                                        const orderId = order._id || order.id || order.publicId;
                                        const orderKey = orderId || `order-${idx}`;

                                        return (
                                            <div
                                                key={orderKey}
                                                className="bg-white border border-[#ede0c4] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                                            >
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
                                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")} {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
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
                                                                    <h4 className="text-sm font-semibold text-[#2c1a00] line-clamp-1 font-sans">
                                                                        {p.productName || "Sản phẩm Bát Tràng"}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-400 mt-1 font-sans">
                                                                        Số lượng: <span className="text-gray-700 font-semibold">{item.quantity}</span>
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
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
                                                            {order.paymentMethod && order.paymentMethod !== 'cod' && (
                                                                <span className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans border ${
                                                                    order.paymentStatus === 'paid'
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {order.paymentMethod.toUpperCase()}: {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Buttons area — responsive grid on mobile, flex row on md+ */}
                                                    {(() => {
                                                        const hasRepay = order.paymentStatus === 'unpaid' && order.paymentMethod !== 'cod' && order.status === 'pending';
                                                        // Chỉ cho hủy khi pending VÀ (COD hoặc chưa thanh toán)
                                                        // Nếu đã thanh toán VNPay/MoMo → ẩn nút hủy, hướng dẫn dùng hoàn trả
                                                        const hasCancel = order.status === 'pending' &&
                                                            (order.paymentMethod === 'cod' || order.paymentStatus !== 'paid');
                                                        const hasCancelReturn = order.status === 'return_requested';
                                                        const canReturn = (order.status === 'completed' || order.status === 'shipping') && (() => {
                                                            const orderDate = new Date(order.createdAt).getTime();
                                                            const diffDays = (Date.now() - orderDate) / (1000 * 3600 * 24);
                                                            return diffDays <= 14;
                                                        })();
                                                        const totalButtons = 2 + (hasRepay ? 1 : 0) + (hasCancel ? 1 : 0) + (canReturn ? 1 : 0) + (hasCancelReturn ? 1 : 0);
                                                        const detailColSpan = totalButtons === 3 ? 'col-span-2 md:col-span-1' : '';

                                                        return (
                                                            <div className="grid grid-cols-2 gap-2 md:flex md:flex-row md:flex-nowrap md:justify-end md:gap-2">
                                                                {/* Tải hóa đơn PDF — always visible */}
                                                                <button
                                                                    onClick={() => handleDownloadInvoice(order)}
                                                                    disabled={downloadingInvoiceId === orderId}
                                                                    className="h-9 px-2 bg-white border border-[#c4a84f] text-[#8b6914] hover:bg-[#fdf8ef] rounded text-[11px] font-bold tracking-[0.3px] uppercase transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5 text-[#c4a84f] shrink-0" />
                                                                    <span className="truncate">{downloadingInvoiceId === orderId ? 'Đang xuất...' : 'Tải hóa đơn PDF'}</span>
                                                                </button>

                                                                {/* Hủy yêu cầu hoàn trả — only if return_requested */}
                                                                {hasCancelReturn && (
                                                                    <button
                                                                        onClick={() => openCancelReturnModal(order)}
                                                                        disabled={cancellingReturnId === orderId}
                                                                        className="h-9 px-2 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                                                        <span className="truncate">{cancellingReturnId === orderId ? 'Đang hủy...' : 'Hủy yêu cầu hoàn trả'}</span>
                                                                    </button>
                                                                )}

                                                                {/* Yêu cầu hoàn trả — only if completed/shipping within 14 days */}
                                                                {canReturn && (
                                                                    <button
                                                                        onClick={() => setShowReturnModal(order)}
                                                                        className="h-9 px-2 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                                                        <span className="truncate">Yêu cầu hoàn trả</span>
                                                                    </button>
                                                                )}

                                                                {/* Thanh toán ngay — only if unpaid+pending+non-COD */}
                                                                {hasRepay && (
                                                                    <button
                                                                        onClick={() => handleRepay(order)}
                                                                        disabled={repayingId === orderId}
                                                                        className="h-9 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                                                                    >
                                                                        <span>💳</span>
                                                                        <span className="truncate">{repayingId === orderId ? 'Đang chuyển...' : 'Thanh toán ngay'}</span>
                                                                    </button>
                                                                )}

                                                                {/* Hủy đơn — only if pending */}
                                                                {hasCancel && (
                                                                    <button
                                                                        onClick={() => setShowConfirmModal(order)}
                                                                        disabled={cancellingId === orderId}
                                                                        className="h-9 px-2 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold tracking-[0.3px] uppercase rounded transition-all disabled:opacity-50 font-sans cursor-pointer flex items-center justify-center w-full md:w-auto"
                                                                    >
                                                                        <span className="truncate">{cancellingId === orderId ? 'Đang hủy...' : 'Hủy đơn'}</span>
                                                                    </button>
                                                                )}

                                                                <Link
                                                                    href={`/orders/${order.publicId}`}
                                                                    className={`h-9 px-3 bg-[#2c1a00] text-white hover:bg-[#c4a84f] rounded text-[11px] font-bold tracking-[0.3px] uppercase transition-all no-underline font-sans flex items-center justify-center gap-1 w-full md:w-auto ${detailColSpan}`}
                                                                >
                                                                    <span>Xem chi tiết</span>
                                                                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                                                </Link>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />

            {/* Cancel Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4">
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">Xác nhận hủy đơn hàng</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 font-sans leading-relaxed">
                                Bạn có chắc chắn muốn hủy đơn hàng:
                            </p>
                            <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-700 break-all select-all">
                                {showConfirmModal.publicId}
                            </div>
                            <p className="text-xs text-red-500 font-sans font-medium">
                                * Lưu ý: Hành động này không thể hoàn tác sau khi đã thực hiện.
                            </p>
                        </div>
                        <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                disabled={!!cancellingId}
                                className="px-5 py-2 bg-gray-150 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition font-sans cursor-pointer"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={() => handleCancelOrder(showConfirmModal._id || showConfirmModal.id || "")}
                                disabled={!!cancellingId}
                                className="px-5 py-2 bg-red-650 text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-sans cursor-pointer"
                            >
                                {cancellingId === (showConfirmModal._id || showConfirmModal.id) ? 'Đang xử lý...' : 'Đồng ý hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Return Request Modal */}
            {showReturnModal && (
                <ReturnRequestModal
                    order={showReturnModal}
                    onClose={() => setShowReturnModal(null)}
                    onSuccess={() => fetchOrders()}
                />
            )}

            {/* Cancel Return Request Modal */}
            {showCancelReturnModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#ede0c4] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] uppercase tracking-[1px]">
                                    Hủy Yêu Cầu Hoàn Trả
                                </h3>
                                <p className="text-xs text-gray-500 font-sans mt-0.5">
                                    Đơn hàng: <span className="font-mono font-bold text-[#8b2500]">{showCancelReturnModal.publicId}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (cancelReturnSuccess) fetchOrders();
                                    setShowCancelReturnModal(null);
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
                                        Yêu cầu hoàn trả cho đơn hàng <span className="font-mono font-bold text-[#8b2500]">{showCancelReturnModal.publicId}</span> đã được hủy thành công. Đơn hàng của bạn đã quay trở lại trạng thái <strong>Hoàn thành</strong>.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        fetchOrders();
                                        setShowCancelReturnModal(null);
                                    }}
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
                                        {showCancelReturnModal.publicId}
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-sans italic">
                                        Sau khi hủy, đơn hàng sẽ quay lại trạng thái Hoàn thành. Bạn vẫn có thể gửi lại yêu cầu nếu chưa hết thời hạn 14 ngày.
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-[#ede0c4] flex justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelReturnModal(null)}
                                        disabled={!!cancellingReturnId}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold tracking-[1px] uppercase rounded hover:bg-gray-200 transition cursor-pointer font-sans"
                                    >
                                        Giữ Yêu cầu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => executeCancelReturnRequest(showCancelReturnModal)}
                                        disabled={!!cancellingReturnId}
                                        className="px-5 py-2 bg-[#8b2500] text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-[#6c1d00] transition shadow-sm disabled:opacity-50 cursor-pointer font-sans"
                                    >
                                        {cancellingReturnId ? "Đang xử lý..." : "Xác nhận Hủy"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
