"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VnPayReturnContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    isValid: boolean;
    orderId: string;
    responseCode: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const query = searchParams.toString();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/payments/vnpay/return?${query}`
        );
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Lỗi xác minh thanh toán VNPay:", err);
        setResult({
          isValid: false,
          orderId: searchParams.get("vnp_TxnRef") || "",
          responseCode: searchParams.get("vnp_ResponseCode") || "99",
          message: "Lỗi kết nối máy chủ xác minh",
        });
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.size > 0) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const responseCode = result?.responseCode || searchParams.get("vnp_ResponseCode");
  const isSuccess = responseCode === "00";
  const orderPublicId = result?.orderId || searchParams.get("vnp_TxnRef") || "N/A";
  const amountStr = searchParams.get("vnp_Amount");
  const amount = amountStr ? parseInt(amountStr, 10) / 100 : 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between">
      {/* Brand Header */}
      <div className="bg-white border-b border-[#ede0c4] py-4 text-center">
        <Link href="/">
          <img
            src="/assets/logo2.png"
            alt="Bát Tràng"
            className="h-10 md:h-12 w-auto mx-auto object-contain"
          />
        </Link>
      </div>

      <main className="max-w-xl w-full mx-auto px-4 py-10 my-auto">
        <div className="bg-white border border-[#ede0c4] rounded-lg p-6 sm:p-8 shadow-sm text-center">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#c4a84f] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#2c1a00] font-medium font-sans">
                Đang xác minh kết quả thanh toán VNPay...
              </p>
            </div>
          ) : isSuccess ? (
            <div>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-[#2c1a00] mb-2 font-['Cormorant_Garamond',_serif]">
                Thanh Toán VNPay Thành Công!
              </h1>
              <p className="text-sm text-gray-600 mb-6 font-sans">
                Đơn hàng của bạn đã được xác nhận thanh toán thành công qua cổng thanh toán VNPay Sandbox.
              </p>

              <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded p-4 mb-6 text-left text-sm font-sans space-y-2">
                <div className="flex justify-between border-b border-[#ede0c4] pb-2">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-[#2c1a00]">{orderPublicId}</span>
                </div>
                {amount > 0 && (
                  <div className="flex justify-between border-b border-[#ede0c4] pb-2">
                    <span className="text-gray-600">Số tiền thanh toán:</span>
                    <span className="font-semibold text-[#c4a84f]">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-[#ede0c4] pb-2">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-semibold text-blue-600">💳 VNPay Gateway</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-semibold text-emerald-600">Đã thanh toán (Paid)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/orders/history"
                  className="bg-[#c4a84f] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors font-sans"
                >
                  Xem lịch sử đơn hàng
                </Link>
                <Link
                  href="/"
                  className="bg-white border border-[#ede0c4] text-[#2c1a00] px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors font-sans"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-[#2c1a00] mb-2 font-['Cormorant_Garamond',_serif]">
                Thanh Toán Không Thành Công
              </h1>
              <p className="text-sm text-gray-600 mb-6 font-sans">
                {result?.message || "Giao dịch thanh toán đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý."}
              </p>

              <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded p-4 mb-6 text-left text-sm font-sans space-y-2">
                <div className="flex justify-between border-b border-[#ede0c4] pb-2">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-[#2c1a00]">{orderPublicId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã phản hồi:</span>
                  <span className="font-semibold text-rose-600">{responseCode || "Hủy"}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/orders/history"
                  className="bg-[#c4a84f] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors font-sans"
                >
                  Đến Lịch sử đơn hàng (Thanh toán lại)
                </Link>
                <Link
                  href="/"
                  className="bg-white border border-[#ede0c4] text-[#2c1a00] px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors font-sans"
                >
                  Trở về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VnPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
          <div className="text-center font-sans text-gray-600">Đang tải...</div>
        </div>
      }
    >
      <VnPayReturnContent />
    </Suspense>
  );
}
