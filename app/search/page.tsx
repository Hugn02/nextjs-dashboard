import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import SearchPage from "@/src/features/search/pages/SearchPage";

export const metadata: Metadata = {
  title: "Tìm kiếm sản phẩm — Bát Tràng Vietnam",
  description: "Tìm kiếm sản phẩm sứ cao cấp Bát Tràng theo tên, bộ sưu tập hoặc chức năng.",
};

export default function SearchRoute() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[80vh] flex items-center justify-center mt-[130px]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-[13px] text-[#aaa] font-['Cormorant_Garamond',_serif]">
                Đang tải...
              </p>
            </div>
          </div>
        }
      >
        <SearchPage />
      </Suspense>
      <Footer />
    </>
  );
}
