"use client";

import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { useState, useEffect } from "react";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"doi-tra" | "giao-hang" | "huong-dan" | "cua-hang">("doi-tra");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["doi-tra", "giao-hang", "huong-dan", "cua-hang"].includes(hash)) {
      setActiveTab(hash as any);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf7f2] pt-[100px] md:pt-[130px] pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[13px] tracking-[3px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
              Trung tâm hỗ trợ khách hàng
            </p>
            <h1 className="text-[clamp(26px,4vw,42px)] font-['Cormorant_Garamond',_serif] text-[#2c1a00] font-normal tracking-[1px] m-0">
              CHÍNH SÁCH & DỊCH VỤ BÁT TRÀNG
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 border-b border-[#ede0c4] pb-4">
            {[
              { id: "doi-tra", label: "🛡️ Chính sách đổi trả" },
              { id: "giao-hang", label: "🚚 Chính sách giao hàng" },
              { id: "huong-dan", label: "📖 Hướng dẫn mua hàng" },
              { id: "cua-hang", label: "📍 Hệ thống cửa hàng" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.location.hash = tab.id;
                }}
                className={`px-5 py-3 rounded-t-md text-[14px] md:text-[15px] font-['Cormorant_Garamond',_serif] font-semibold transition-all duration-300 border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#8b6914] text-[#8b6914] bg-white shadow-sm"
                    : "border-transparent text-[#7a5c30] hover:text-[#8b6914] hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-lg border border-[#ede0c4] p-6 md:p-10 shadow-sm text-[#4a3318] leading-[1.8] font-sans">
            {activeTab === "doi-tra" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Cormorant_Garamond',_serif] text-[#2c1a00] font-semibold border-b border-[#f0e8d6] pb-3">
                  Chính sách đổi trả & Bảo hành bể vỡ
                </h2>
                <div className="space-y-4 text-[15px]">
                  <p>
                    <strong>1. Bảo hành 100% bể vỡ do vận chuyển:</strong> Tất cả sản phẩm gốm sứ Bát Tràng gửi đi đều được đóng gói tiêu chuẩn chống sốc chuyên dụng. Trong trường hợp hàng hóa bị nứt vỡ hoặc tổn thất trong quá trình giao vận, Bát Tràng hỗ trợ đổi mới 1:1 hoàn toàn miễn phí.
                  </p>
                  <p>
                    <strong>2. Thời gian tiếp nhận đổi trả:</strong> Quý khách vui lòng kiểm tra sản phẩm khi nhận hàng và phản hồi trong vòng <strong>48 giờ</strong> kể từ khi nhận được đơn hàng.
                  </p>
                  <p>
                    <strong>3. Điều kiện đổi trả:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng.</li>
                    <li>Có hình ảnh hoặc video mở gói hàng (unboxing) chứng minh sản phẩm bị lỗi/bể vỡ.</li>
                    <li>Sản phẩm giao không đúng chủng loại, mẫu mã như đơn đặt hàng.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "giao-hang" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Cormorant_Garamond',_serif] text-[#2c1a00] font-semibold border-b border-[#f0e8d6] pb-3">
                  Chính sách vận chuyển & Giao nhận
                </h2>
                <div className="space-y-4 text-[15px]">
                  <p>
                    <strong>1. Phạm vi giao hàng:</strong> Giao hàng tận nơi trên toàn quốc (63 tỉnh thành).
                  </p>
                  <p>
                    <strong>2. Thời gian giao hàng dự kiến:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Khu vực Hà Nội & TP. Hồ Chí Minh: 1 - 2 ngày làm việc.</li>
                    <li>Các tỉnh thành khác: 3 - 5 ngày làm việc.</li>
                  </ul>
                  <p>
                    <strong>3. Đồng kiểm khi nhận hàng:</strong> Khách hàng được quyền mở gói hàng kiểm tra sản phẩm trước khi thanh toán cho nhân viên giao hàng (COD).
                  </p>
                </div>
              </div>
            )}

            {activeTab === "huong-dan" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Cormorant_Garamond',_serif] text-[#2c1a00] font-semibold border-b border-[#f0e8d6] pb-3">
                  Hướng dẫn mua hàng & Thanh toán
                </h2>
                <div className="space-y-4 text-[15px]">
                  <p>
                    <strong>Bước 1: Tìm kiếm & Chọn sản phẩm</strong><br />
                    Duyệt các danh mục Bộ ấm trà, Bát đĩa, Bình hoa... trên website hoặc tìm theo từ khóa.
                  </p>
                  <p>
                    <strong>Bước 2: Thêm vào giỏ hàng</strong><br />
                    Chọn số lượng và nhấn "Thêm vào giỏ hàng" hoặc "Mua ngay".
                  </p>
                  <p>
                    <strong>Bước 3: Xác nhận đơn hàng & Thanh toán</strong><br />
                    Điền đầy đủ thông tin giao hàng, kiểm tra lại số tiền và chọn phương thức thanh toán (COD hoặc Chuyển khoản ngân hàng).
                  </p>
                  <p>
                    <strong>Bước 4: Theo dõi đơn hàng</strong><br />
                    Mã đơn hàng sẽ gửi về lịch sử đơn hàng của bạn. Bạn có thể kiểm tra trạng thái đơn bất cứ lúc nào.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "cua-hang" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Cormorant_Garamond',_serif] text-[#2c1a00] font-semibold border-b border-[#f0e8d6] pb-3">
                  Hệ thống Showroom Bát Tràng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
                  <div className="p-4 rounded border border-[#ede0c4] bg-[#fdfaf4]">
                    <h3 className="font-bold text-[#8b6914] text-lg mb-2">📍 Showroom Hà Nội</h3>
                    <p>Địa chỉ: Xóm 1, Làng gốm Bát Tràng, Gia Lâm, Hà Nội</p>
                    <p>Hotline: 0901 234 567</p>
                    <p>Giờ mở cửa: 08:00 - 20:00 (Tất cả các ngày)</p>
                  </div>
                  <div className="p-4 rounded border border-[#ede0c4] bg-[#fdfaf4]">
                    <h3 className="font-bold text-[#8b6914] text-lg mb-2">📍 Showroom TP. Hồ Chí Minh</h3>
                    <p>Địa chỉ: 456 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7, TP.HCM</p>
                    <p>Hotline: 0909 876 543</p>
                    <p>Giờ mở cửa: 08:30 - 21:30 (Tất cả các ngày)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
