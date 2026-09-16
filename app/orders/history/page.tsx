"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";

import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { User } from "@/src/features/auth/types/auth.types";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { fetchWithAuth } from "@/src/lib/api-client";
import useCart from "@/src/features/cart/hooks/useCart";
import { OrderHistoryItem } from "@/src/features/orders/types";

import OrderHistoryTabsFilter, { TabItem } from "@/src/features/orders/components/history/OrderHistoryTabsFilter";
import OrderHistoryCard from "@/src/features/orders/components/history/OrderHistoryCard";
import OrderHistoryPagination from "@/src/features/orders/components/history/OrderHistoryPagination";
import OrderCancelReturnModal from "@/src/features/orders/components/history/OrderCancelReturnModal";
import OrderCancelModal from "@/src/features/orders/components/detail/OrderCancelModal";
import ReturnRequestModal from "@/src/components/ReturnRequestModal";
import ViewReturnDetailModal from "@/src/components/ViewReturnDetailModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const TABS: TabItem[] = [
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
    const router = useRouter();
    const { addItem, setSelectedIds } = useCart();
    const { user: authUser, token } = useAuthStore();
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [repayingId, setRepayingId] = useState<string | null>(null);
    const [reorderingId, setReorderingId] = useState<string | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    const [showConfirmModal, setShowConfirmModal] = useState<OrderHistoryItem | null>(null);
    const [showReturnModal, setShowReturnModal] = useState<OrderHistoryItem | null>(null);
    const [showCancelReturnModal, setShowCancelReturnModal] = useState<OrderHistoryItem | null>(null);
    const [showViewReturnModal, setShowViewReturnModal] = useState<OrderHistoryItem | null>(null);

    const [cancelReturnSuccess, setCancelReturnSuccess] = useState<boolean>(false);
    const [cancelReturnError, setCancelReturnError] = useState<string | null>(null);
    const [cancellingReturnId, setCancellingReturnId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(5);
    const ordersListRef = useRef<HTMLDivElement>(null);

    const handleReorder = async (order: OrderHistoryItem) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId || !order.items || order.items.length === 0) return;

        setReorderingId(orderId);
        try {
            const productIds: string[] = [];
            const failedProducts: string[] = [];

            for (const item of order.items) {
                const pid = item.product?._id || item.product?.id;
                const pName = item.product?.productName || "Sản phẩm";
                if (pid) {
                    try {
                        await addItem(pid, item.quantity || 1);
                        productIds.push(pid);
                    } catch (err: any) {
                        failedProducts.push(pName);
                    }
                }
            }

            // Nếu tất cả sản phẩm đều thất bại (hết hàng)
            if (productIds.length === 0) {
                const msg = failedProducts.length === 1
                    ? `Sản phẩm "${failedProducts[0]}" trong đơn hàng hiện đã hết hàng hoặc không đủ tồn kho để mua lại.`
                    : `Tất cả sản phẩm trong đơn hàng (${failedProducts.join(", ")}) hiện đã hết hàng hoặc không đủ tồn kho để mua lại.`;
                window.dispatchEvent(
                    new CustomEvent("cart-warning", {
                        detail: {
                            title: "Sản phẩm đã hết hàng",
                            message: msg,
                            actionText: "Xem sản phẩm khác",
                            actionHref: "/products/all",
                        },
                    })
                );
                return;
            }

            // Có ít nhất 1 sản phẩm thêm thành công
            setSelectedIds(new Set(productIds));
            localStorage.setItem("checkout_selected_ids", JSON.stringify(productIds));

            if (failedProducts.length > 0) {
                window.dispatchEvent(
                    new CustomEvent("cart-warning", {
                        detail: {
                            title: "Thông báo mua lại",
                            message: `Đã thêm ${productIds.length} sản phẩm vào giỏ hàng. Riêng sản phẩm "${failedProducts.join(", ")}" hiện đã hết hàng nên không thể thêm lại.`,
                            actionText: "Đến giỏ hàng",
                            actionHref: "/cart",
                        },
                    })
                );
            } else {
                router.push("/cart");
            }
        } catch (err: any) {
            window.dispatchEvent(
                new CustomEvent("cart-warning", {
                    detail: {
                        title: "Không thể mua lại",
                        message: err.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.",
                    },
                })
            );
        } finally {
            setReorderingId(null);
        }
    };

    const handleDownloadInvoice = async (order: OrderHistoryItem) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setDownloadingInvoiceId(orderId);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/${orderId}/invoice`);
            if (!res.ok) {
                throw new Error("Không thể lấy dữ liệu hóa đơn.");
            }
            const data = await res.json();
            const invoiceData = data.data || data;

            const { downloadOrderInvoicePdf } = await import("@/src/lib/downloadOrderInvoicePdf");
            await downloadOrderInvoicePdf(invoiceData);
        } catch (err: any) {
            alert(err.message || "Lỗi khi tải hóa đơn PDF.");
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const openCancelReturnModal = (order: OrderHistoryItem) => {
        setShowCancelReturnModal(order);
        setCancelReturnSuccess(false);
        setCancelReturnError(null);
    };

    const executeCancelReturnRequest = async (order: OrderHistoryItem) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setCancellingReturnId(orderId);
        setCancelReturnError(null);

        try {
            const res = await fetchWithAuth(`${API_URL}/returns/order/${orderId}/cancel`, {
                method: "POST",
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Không thể hủy yêu cầu hoàn trả.");
            }

            setCancelReturnSuccess(true);
        } catch (err: any) {
            setCancelReturnError(err.message || "Có lỗi xảy ra khi hủy yêu cầu hoàn trả.");
        } finally {
            setCancellingReturnId(null);
        }
    };

    const handleRepay = async (order: OrderHistoryItem) => {
        const orderId = order.publicId || order._id || order.id;
        if (!orderId) return;

        setRepayingId(orderId);
        try {
            const response = await fetchWithAuth(`${API_URL}/payments/${orderId}/repay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentMethod: order.paymentMethod || "vnpay",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Không thể tạo link thanh toán.");
            }

            const data = await response.json();
            const payResult = data.data || data;
            if (payResult?.paymentUrl) {
                window.location.href = payResult.paymentUrl;
            } else {
                alert("Không thể tạo URL thanh toán. Vui lòng thử lại.");
            }
        } catch (err: any) {
            alert(err.message || "Có lỗi xảy ra khi tạo thanh toán.");
        } finally {
            setRepayingId(null);
        }
    };

    const userId = user?.id || user?.email;

    useEffect(() => {
        if (authUser) {
            setUser((prev) => {
                if (prev?.id === authUser.id && prev?.email === authUser.email) {
                    return prev;
                }
                return authUser;
            });
        } else if (!token) {
            setLoading(false);
        }
    }, [authUser, token]);

    const fetchOrders = useCallback(async () => {
        if (!userId) return;

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
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId, fetchOrders]);

    const handleCancelOrder = async (orderId: string) => {
        setCancellingId(orderId);
        try {
            const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/cancel`, {
                method: "PATCH",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Hủy đơn hàng thất bại.");
            }

            // Cập nhật trạng thái
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: "cancelled" } : order
                )
            );
            setShowConfirmModal(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    // Lọc đơn hàng theo tab và tìm kiếm
    const filteredOrders = useMemo(() => {
        let list = activeTab === "all"
            ? orders
            : orders.filter((o) => o.status === activeTab);

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter((o) => {
                const matchPublicId = (o.publicId || "").toLowerCase().includes(q);
                const matchProduct = (o.items || []).some((item) =>
                    (item.product?.productName || "").toLowerCase().includes(q)
                );
                return matchPublicId || matchProduct;
            });
        }
        return list;
    }, [orders, activeTab, searchQuery]);

    // Tính toán phân trang
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
    const startIndex = (currentPage - 1) * ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        ordersListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto mt-8 md:mt-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="text-[#c4a84f] text-xs font-bold tracking-[4px] uppercase mb-2 block">
                            Tài khoản của bạn
                        </span>
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
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] mb-2">
                                Bạn chưa đăng nhập
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 font-sans">
                                Vui lòng đăng nhập để xem thông tin lịch sử mua hàng của mình.
                            </p>
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
                            {/* Anchor scroll khi đổi trang */}
                            <div ref={ordersListRef} className="scroll-mt-32"></div>

                            {/* Search bar & Tabs filter */}
                            <OrderHistoryTabsFilter
                                searchQuery={searchQuery}
                                onSearchChange={(q) => {
                                    setSearchQuery(q);
                                    setCurrentPage(1);
                                }}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                tabs={TABS}
                                orders={orders}
                                filteredCount={filteredOrders.length}
                            />

                            {/* Orders list */}
                            {filteredOrders.length === 0 ? (
                                <div className="bg-white border border-[#ede0c4] rounded-lg p-16 text-center shadow-sm">
                                    <ShoppingBag className="w-16 h-16 text-[#c4a84f] mx-auto mb-4 stroke-1" />
                                    {searchQuery.trim() ? (
                                        <>
                                            <p className="text-gray-800 font-bold text-base mb-1 font-sans">
                                                Không tìm thấy đơn hàng nào
                                            </p>
                                            <p className="text-gray-500 text-xs mb-6 font-sans">
                                                Không có đơn hàng nào khớp với từ khóa &ldquo;<span className="font-semibold text-gray-700">{searchQuery}</span>&rdquo; trong danh mục này.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setCurrentPage(1);
                                                }}
                                                className="inline-block bg-[#c4a84f] text-white px-6 py-2.5 rounded text-xs font-bold tracking-[1px] uppercase font-sans hover:bg-[#a8893a] transition-all cursor-pointer"
                                            >
                                                Xóa bộ lọc tìm kiếm
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-gray-500 text-sm mb-6 font-sans">
                                                Bạn chưa có đơn hàng nào trong trạng thái này.
                                            </p>
                                            <Link
                                                href="/products/all"
                                                className="inline-block bg-[#c4a84f] text-white px-8 py-3.5 rounded text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] hover:bg-[#a8893a] transition-all no-underline"
                                            >
                                                Bắt đầu mua sắm
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {paginatedOrders.map((order, idx) => (
                                        <OrderHistoryCard
                                            key={order._id || order.id || order.publicId || `order-${idx}`}
                                            order={order}
                                            downloadingInvoiceId={downloadingInvoiceId}
                                            cancellingReturnId={cancellingReturnId}
                                            reorderingId={reorderingId}
                                            repayingId={repayingId}
                                            cancellingId={cancellingId}
                                            onDownloadInvoice={handleDownloadInvoice}
                                            onViewReturnModal={(ord) => setShowViewReturnModal(ord)}
                                            onOpenCancelReturnModal={openCancelReturnModal}
                                            onShowReturnModal={(ord) => setShowReturnModal(ord)}
                                            onReorder={handleReorder}
                                            onRepay={handleRepay}
                                            onCancelOrderModal={(ord) => setShowConfirmModal(ord)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            <OrderHistoryPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                startIndex={startIndex}
                                ordersPerPage={ordersPerPage}
                                totalOrders={filteredOrders.length}
                                onPageChange={handlePageChange}
                                onOrdersPerPageChange={(perPage) => {
                                    setOrdersPerPage(perPage);
                                    setCurrentPage(1);
                                }}
                            />
                        </>
                    )}
                </div>
            </main>
            <Footer />

            {/* Cancel Confirm Modal */}
            {showConfirmModal && (
                <OrderCancelModal
                    publicId={showConfirmModal.publicId}
                    cancelling={cancellingId === (showConfirmModal._id || showConfirmModal.id)}
                    onClose={() => setShowConfirmModal(null)}
                    onConfirm={() => handleCancelOrder(showConfirmModal._id || showConfirmModal.id || "")}
                />
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
                <OrderCancelReturnModal
                    order={showCancelReturnModal}
                    cancellingReturnId={cancellingReturnId}
                    cancelReturnSuccess={cancelReturnSuccess}
                    cancelReturnError={cancelReturnError}
                    onClose={() => setShowCancelReturnModal(null)}
                    onConfirm={executeCancelReturnRequest}
                    onSuccessClose={() => {
                        fetchOrders();
                        setShowCancelReturnModal(null);
                    }}
                />
            )}

            {/* View Return Detail Modal */}
            {showViewReturnModal && (
                <ViewReturnDetailModal
                    order={showViewReturnModal}
                    onClose={() => setShowViewReturnModal(null)}
                    onCancelSuccess={() => fetchOrders()}
                />
            )}
        </>
    );
}
