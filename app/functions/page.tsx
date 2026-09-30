import AllFunctionsPage from "@/src/features/products/pages/AllFunctionsPage";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tất cả công năng gốm sứ Bát Tràng | Tinh Hoa Gốm Việt",
  description: "Khám phá các dòng sản phẩm gốm Bát Tràng theo nhu cầu thực tế: pha trà, ẩm thực, phong thủy, quà tặng và đồ thờ cúng gia tiên.",
};

export default function FunctionsIndexPage() {
  return (
    <>
      <Navbar />
      <AllFunctionsPage />
      <Footer />
    </>
  );
}
