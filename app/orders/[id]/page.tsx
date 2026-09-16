"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { fetchWithAuth } from "@/src/lib/api-client";
import { ArrowLeft, Calendar, FileText, HelpCircle } from "lucide-react";
import ViewReturnDetailModal from "@/src/components/ViewReturnDetailModal";
import ReturnRequestModal from "@/src/components/ReturnRequestModal";
import useCart from "@/src/features/cart/hooks/useCart";

import { OrderDetail } from "@/src/features/orders/types";
import OrderDetailStatusStepper from "@/src/features/orders/components/detail/OrderDetailStatusStepper";
import OrderDetailItemsCard from "@/src/features/orders/components/detail/OrderDetailItemsCard";
import OrderDetailPaymentCard from "@/src/features/orders/components/detail/OrderDetailPaymentCard";
import OrderDetailDeliveryCard from "@/src/features/orders/components/detail/OrderDetailDeliveryCard";
import OrderConfirmReceivedModal from "@/src/features/orders/components/detail/OrderConfirmReceivedModal";
import OrderCancelModal from "@/src/features/orders/components/detail/OrderCancelModal";
import OrderBatchReviewModal from "@/src/features/orders/components/detail/OrderBatchReviewModal";

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
    const [showViewReturnModal, setShowViewReturnModal] = useState<OrderDetail | null>(null);
    const [showReturnModal, setShowReturnModal] = useState<OrderDetail | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [confirmingReceipt, setConfirmingReceipt] = useState(false);
    const [showConfirmReceivedModal, setShowConfirmReceivedModal] = useState(false);
    const [syncingShipping, setSyncingShipping] = useState(false);
    const [syncMsg, setSyncMsg] = useState<string | null>(null);

    // Reviews state
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [showBatchModal, setShowBatchModal] = useState(false);

    const { addItem, setSelectedIds } = useCart();

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
        fetchMyReviews();
    }, []);

    useEffect(() => {
        fetchOrder();
    }, [id]);

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

    const allReviewed = order?.items.every((item) => {
        const pid = item.product?.id || item.product?._id;
        return pid ? checkIsReviewed(pid) : false;
    }) ?? false;

    const handleReorder = async () => {
        if (!order || !order.items || order.items.length === 0) return;
        setReordering(true);
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
            setReordering(false);
        }
    };

    const handleDownloadInvoicePdf = async () => {
        if (!order) return;
        setDownloadingPdf(true);
        try {
            const { downloadOrderInvoicePdf } = await import("@/src/lib/downloadOrderInvoicePdf");
            await downloadOrderInvoicePdf(order);
        } catch (err: any) {
            alert(err.message || "Lỗi khi xuất file PDF.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!id) return;
        setCancelling(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/orders/${id}/cancel`, {
                method: "PATCH",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Hủy đơn hàng thất bại.");
            }

            await fetchOrder();
            setShowCancelModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCancelling(false);
        }
    };

    const handleConfirmReceipt = async () => {
        if (!id) return;
        setConfirmingReceipt(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/orders/${id}/confirm-receipt`, {
                method: "PATCH",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Xác nhận nhận hàng thất bại.");
            }

            setShowConfirmReceivedModal(false);
            await fetchOrder();
        } catch (err: any) {
            alert(err.message || "Có lỗi xảy ra khi xác nhận nhận hàng.");
        } finally {
            setConfirmingReceipt(false);
        }
    };

    const handleSyncShipping = async () => {
        if (!id) return;
        setSyncingShipping(true);
        setSyncMsg(null);
        try {
            const res = await fetchWithAuth(`${API_URL}/orders/${id}/sync-shipping`, {
                method: "POST",
            });
            const data = await res.json();
            if (data?.message) {
                setSyncMsg(data.message);
                setTimeout(() => setSyncMsg(null), 4000);
            }
            await fetchOrder();
        } catch (err: any) {
            setSyncMsg("Không thể cập nhật tiến độ bưu kiện lúc này.");
            setTimeout(() => setSyncMsg(null), 4000);
        } finally {
            setSyncingShipping(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto mt-8 md:mt-12">
                    {/* Back Button + Download Invoice */}
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <Link
                            href="/orders/history"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#c4a84f] text-xs font-bold tracking-[1px] uppercase transition-colors no-underline font-sans flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden xs:inline sm:inline">Quay lại lịch sử đơn hàng</span>
                            <span className="xs:hidden sm:hidden">Quay lại</span>
                        </Link>

                        {order && (
                            <button
                                type="button"
                                onClick={handleDownloadInvoicePdf}
                                disabled={downloadingPdf}
                                className="inline-flex items-center gap-1.5 bg-white border border-[#c4a84f] text-[#8b6914] hover:bg-[#fdf8ef] h-8 px-3 rounded text-[11px] font-bold tracking-[0.5px] uppercase transition-all disabled:opacity-50 font-sans cursor-pointer shadow-sm flex-shrink-0"
                            >
                                <FileText className="w-3.5 h-3.5 text-[#c4a84f] shrink-0" />
                                <span>{downloadingPdf ? "Đang xuất..." : "Tải hóa đơn PDF"}</span>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-20 bg-white border border-[#ede0c4] rounded-lg shadow-sm">
                            <div className="w-10 h-10 border-4 border-[#c4a84f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-sm text-gray-500 font-sans">Đang tải chi tiết đơn hàng...</p>
                        </div>
                    ) : error || !order ? (
                        <div className="bg-white border border-[#ede0c4] rounded-lg p-16 text-center shadow-sm max-w-lg mx-auto">
                            <HelpCircle className="w-16 h-16 text-[#c4a84f] mx-auto mb-4 stroke-1" />
                            <h3 className="text-lg font-bold text-[#2c1a00] font-['Cormorant_Garamond',_serif] mb-2">
                                Không tìm thấy đơn hàng
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 font-sans">
                                {error || "Mã đơn hàng không hợp lệ hoặc đã bị xóa khỏi hệ thống."}
                            </p>
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

                            {/* Visual Progress Stepper & Status Banners */}
                            <OrderDetailStatusStepper order={order} />

                            {/* Two Column details grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                                {/* Left Column: Order Items & Payment Breakdown */}
                                <div className="lg:col-span-2 space-y-6">
                                    <OrderDetailItemsCard items={order.items} />

                                    <OrderDetailPaymentCard
                                        order={order}
                                        syncingShipping={syncingShipping}
                                        syncMsg={syncMsg}
                                        reordering={reordering}
                                        allReviewed={allReviewed}
                                        onSyncShipping={handleSyncShipping}
                                        onConfirmReceived={() => setShowConfirmReceivedModal(true)}
                                        onCancelOrder={() => setShowCancelModal(true)}
                                        onReorder={handleReorder}
                                        onViewReturn={() => setShowViewReturnModal(order)}
                                        onRequestReturn={() => setShowReturnModal(order)}
                                        onOpenReview={() => setShowBatchModal(true)}
                                    />
                                </div>

                                {/* Right Column: Delivery Information */}
                                <div className="space-y-6">
                                    <OrderDetailDeliveryCard order={order} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Modals */}
            {showConfirmReceivedModal && order && (
                <OrderConfirmReceivedModal
                    order={order}
                    confirmingReceipt={confirmingReceipt}
                    onClose={() => setShowConfirmReceivedModal(false)}
                    onConfirm={handleConfirmReceipt}
                />
            )}

            {showCancelModal && (
                <OrderCancelModal
                    publicId={order?.publicId}
                    cancelling={cancelling}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelOrder}
                />
            )}

            {showBatchModal && order && (
                <OrderBatchReviewModal
                    order={order}
                    myReviews={myReviews}
                    isOpen={showBatchModal}
                    onClose={() => setShowBatchModal(false)}
                    onSuccess={async () => {
                        await fetchMyReviews();
                    }}
                />
            )}

            {showReturnModal && (
                <ReturnRequestModal
                    order={showReturnModal}
                    onClose={() => setShowReturnModal(null)}
                    onSuccess={() => {
                        setShowReturnModal(null);
                        fetchOrder();
                    }}
                />
            )}

            {showViewReturnModal && (
                <ViewReturnDetailModal
                    order={showViewReturnModal}
                    onClose={() => setShowViewReturnModal(null)}
                    onCancelSuccess={() => fetchOrder()}
                />
            )}
        </>
    );
}
