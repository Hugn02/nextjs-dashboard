import AllCategoriesPage from "@/src/features/products/pages/AllCategoriesPage";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tất cả loại sản phẩm gốm sứ Bát Tràng | Tinh Hoa Gốm Việt",
  description: "Khám phá các loại sản phẩm gốm sứ Bát Tràng: ấm chén, bát đĩa, bình hoa, đồ thờ cúng, phong thủy chế tác thủ công tinh xảo.",
};

export default function CategoriesIndexPage() {
  return (
    <>
      <Navbar />
      <AllCategoriesPage />
      <Footer />
    </>
  );
}
