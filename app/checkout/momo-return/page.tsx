"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MoMoReturnContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    isValid: boolean;
    publicId: string;
    resultCode: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paramsObj: Record<string, any> = {};
        searchParams.forEach((val, key) => {
          paramsObj[key] = val;
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/payments/momo/ipn`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paramsObj),
          }
        );
        const data = await res.json();
        
        const resultCode = searchParams.get("resultCode");
        const orderId = searchParams.get("orderId");
        const publicId = searchParams.get("publicId") || (orderId ? orderId.split("_")[0] : "N/A");

        setResult({
          isValid: data.resultCode === 0 || resultCode === "0",
          publicId,
          resultCode: Number(resultCode || 0),
          message: searchParams.get("message") || data.message || "Xử lý thanh toán MoMo",
        });
      } catch (err) {
        console.error("Lỗi xác minh thanh toán MoMo:", err);
        const orderId = searchParams.get("orderId");
        setResult({
          isValid: false,
          publicId: searchParams.get("publicId") || (orderId ? orderId.split("_")[0] : "N/A"),
          resultCode: 99,
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

  const resultCode = searchParams.get("resultCode");
  const isSuccess = resultCode === "0" || result?.isValid === true;
  const orderPublicId = result?.publicId || searchParams.get("publicId") || "N/A";
  const amountStr = searchParams.get("amount");
  const amount = amountStr ? parseInt(amountStr, 10) : 0;

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
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#2c1a00] font-medium font-sans">
                Đang xác minh kết quả thanh toán Ví MoMo...
              </p>
            </div>
          ) : isSuccess ? (
            <div>
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                Thanh Toán MoMo Thành Công!
              </h1>
              <p className="text-sm text-gray-600 mb-6 font-sans">
                Đơn hàng của bạn đã được xác nhận thanh toán qua Ví MoMo Sandbox.
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
                  <span className="font-semibold text-pink-600">📱 Ví MoMo</span>
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
                Thanh Toán MoMo Thất Bại
              </h1>
              <p className="text-sm text-gray-600 mb-6 font-sans">
                {result?.message || "Giao dịch qua Ví MoMo bị gián đoạn hoặc không thành công."}
              </p>

              <div className="bg-[#fbfaf8] border border-[#ede0c4] rounded p-4 mb-6 text-left text-sm font-sans space-y-2">
                <div className="flex justify-between border-b border-[#ede0c4] pb-2">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-[#2c1a00]">{orderPublicId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã kết quả:</span>
                  <span className="font-semibold text-rose-600">{resultCode || "Thất bại"}</span>
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

export default function MoMoReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
          <div className="text-center font-sans text-gray-600">Đang tải...</div>
        </div>
      }
    >
      <MoMoReturnContent />
    </Suspense>
  );
}
