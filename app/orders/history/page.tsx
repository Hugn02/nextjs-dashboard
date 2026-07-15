"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { User } from "@/src/features/auth/types/auth.types";
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
    ArrowLeft
} from "lucide-react";

interface Order {
    _id: string;
    total: number;
    status: string;
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
    { id: "cancelled", label: "Đã hủy" },
];

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                setUser(null);
            }
        } else {
            setLoading(false);
        }
    }, []);

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
                            {/* Tabs filter */}
                            <div className="flex overflow-x-auto pb-2 mb-8 border-b border-[#ede0c4] gap-2 md:gap-4 no-scrollbar">
                                {TABS.map((tab) => {
                                    const count = tab.id === "all"
                                        ? orders.length
                                        : orders.filter(o => o.status === tab.id).length;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-4 py-2.5 text-xs font-bold tracking-[1px] uppercase whitespace-nowrap border-b-2 transition-all font-sans cursor-pointer ${activeTab === tab.id
                                                    ? "border-[#c4a84f] text-[#c4a84f]"
                                                    : "border-transparent text-gray-400 hover:text-[#2c1a00]"
                                                }`}
                                        >
                                            {tab.label} ({count})
                                        </button>
                                    );
                                })}
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
                                    {filteredOrders.map((order) => {
                                        const statusCfg = getStatusConfig(order.status);
                                        const StatusIcon = statusCfg.icon;
                                        return (
                                            <div
                                                key={order._id}
                                                className="bg-white border border-[#ede0c4] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                                            >
                                                {/* Header of Order Card */}
                                                <div className="bg-[#fbfaf8] border-b border-[#ede0c4] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <span className="text-xs text-gray-400 font-sans">Mã đơn:</span>
                                                            <span className="font-mono text-sm font-semibold text-gray-800">{order._id}</span>
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
                                                    {order.items.map((item, idx) => {
                                                        const p = item.product || {};
                                                        const imgUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                                                        return (
                                                            <div key={idx} className="py-4 flex gap-4 items-center">
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
                                                <div className="bg-[#fbfaf8] border-t border-[#ede0c4] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-450 uppercase tracking-wider font-sans">Tổng thanh toán:</span>
                                                        <span className="text-lg font-extrabold text-[#8b2500] font-sans">{formatPrice(order.total)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                        {order.status === 'pending' && (
                                                            <button
                                                                onClick={() => setShowConfirmModal(order)}
                                                                disabled={cancellingId === order._id}
                                                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold tracking-[1px] uppercase rounded transition-colors disabled:opacity-50 font-sans cursor-pointer"
                                                            >
                                                                {cancellingId === order._id ? 'Đang hủy...' : 'Hủy đơn'}
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/orders/${order._id}`}
                                                            className="flex items-center gap-1 bg-[#2c1a00] text-white hover:bg-[#c4a84f] px-5 py-2 rounded text-xs font-bold tracking-[1px] uppercase transition-colors no-underline font-sans"
                                                        >
                                                            <span>Xem chi tiết</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
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
                                {showConfirmModal._id}
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
                                onClick={() => handleCancelOrder(showConfirmModal._id)}
                                disabled={!!cancellingId}
                                className="px-5 py-2 bg-red-650 text-white text-xs font-bold tracking-[1px] uppercase rounded hover:bg-red-700 transition shadow-sm disabled:opacity-50 font-sans cursor-pointer"
                            >
                                {cancellingId === showConfirmModal._id ? 'Đang xử lý...' : 'Đồng ý hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
