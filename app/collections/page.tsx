import AllCollectionsPage from "@/src/features/products/pages/AllCollectionsPage";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tất cả bộ sưu tập gốm sứ Bát Tràng | Tinh Hoa Gốm Việt",
  description: "Khám phá các bộ sưu tập gốm sứ Bát Tràng thủ công độc bản: men hỏa biến, men rạn, men lam cổ truyền chế tác thủ công tinh xảo.",
};

export default function CollectionsIndexPage() {
  return (
    <>
      <Navbar />
      <AllCollectionsPage />
      <Footer />
    </>
  );
}
