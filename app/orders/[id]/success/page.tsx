"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";

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
  status: string;
  createdAt: string;
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

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (n: number) => {
    return n.toLocaleString("vi-VN") + "₫";
  };

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/orders/${id}`, {
          credentials: 'include'
        });
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
    fetchOrder();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8f5] pt-[88px] md:pt-[120px] pb-16 px-4 md:px-8">
        <div className="max-w-[800px] mx-auto bg-white border border-[#ede0c4] rounded p-6 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#c4a84f] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500">Đang tải thông tin đơn hàng của bạn...</p>
            </div>
          ) : error || !order ? (
            <div className="py-8">
              <span className="text-5xl block mb-4">⚠️</span>
              <h2 className="text-xl font-['Cormorant_Garamond',_serif] text-red-600 font-bold mb-4">
                Có lỗi xảy ra
              </h2>
              <p className="text-sm text-gray-500 mb-8">{error || "Không tìm thấy thông tin đơn hàng."}</p>
              <Link
                href="/products/all"
                className="inline-block bg-[#c4a84f] text-white px-8 py-3 rounded text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] no-underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div>
              {/* Success Checkmark */}
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
                <span className="text-green-600 text-3xl font-bold">✓</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold font-['Cormorant_Garamond',_serif] tracking-[1.5px] text-green-700 uppercase mb-2">
                Đặt hàng thành công!
              </h1>
              <p className="text-sm text-gray-500 max-w-[500px] mx-auto mb-8 font-sans">
                Cảm ơn bạn đã lựa chọn sản phẩm của Nghệ nhân Bát Tràng. Mã đơn hàng của bạn là{" "}
                <strong className="text-gray-800 font-mono select-all bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                  {order._id}
                </strong>.
              </p>

              {/* Order Info Summary */}
              <div className="text-left border border-[#ede0c4] rounded p-6 bg-[#fbfaf8] mb-8">
                <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-[#2c1a00] border-b border-[#ede0c4] pb-2 mb-4">
                  Thông tin khách hàng & Giao nhận
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans mb-6">
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Khách hàng</span>
                    <span className="font-semibold text-gray-800">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Số điện thoại</span>
                    <span className="font-semibold text-gray-800">{order.phone}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Địa chỉ giao hàng</span>
                    <span className="font-semibold text-gray-800">
                      {order.address}, {order.ward}, {order.district}, {order.province}
                    </span>
                  </div>
                  {order.note && (
                    <div className="md:col-span-2">
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-0.5">Ghi chú</span>
                      <span className="text-gray-700 italic">"{order.note}"</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-[#2c1a00] border-b border-[#ede0c4] pb-2 mb-4">
                  Chi tiết sản phẩm đã đặt
                </h3>
                <div className="flex flex-col gap-4 border-b border-[#ede0c4] pb-4 mb-4">
                  {order.items.map((item, idx) => {
                    const p = item.product || {};
                    const imageUrl = p.imageUrl?.[0] || "https://placehold.co/80x80";
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm font-sans">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-white border border-[#ede0c4] rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={p.productName || "Product"}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 line-clamp-1 max-w-[300px] md:max-w-[450px]">
                              {p.productName || "Sản phẩm"}
                            </span>
                            <span className="text-xs text-gray-400">
                              Mặt hàng x {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2 text-sm font-sans border-b border-[#ede0c4] pb-4 mb-4 text-gray-600">
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : "Miễn phí"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phương thức thanh toán:</span>
                    <span className="uppercase">{order.paymentMethod} (Thanh toán khi nhận hàng)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-base font-bold font-sans">
                  <span className="uppercase tracking-wider text-[#2c1a00]">Tổng cộng:</span>
                  <span className="text-xl text-[#8b2500]">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/all"
                  className="bg-[#c4a84f] text-white px-8 py-3.5 hover:bg-[#a8893a] transition-colors text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] rounded no-underline"
                >
                  Tiếp tục mua sắm
                </Link>
                <Link
                  href="/"
                  className="border border-[#c4a84f] text-[#8b6914] hover:bg-[#faf7f2] px-8 py-3.5 transition-all text-xs font-bold tracking-[1.5px] uppercase font-['Cormorant_Garamond',_serif] rounded no-underline"
                >
                  Quay về Trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
