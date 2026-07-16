import dynamic from "next/dynamic";
import HeroSlider from "@/src/features/home/components/HeroSlider";
import TrustBar from "@/src/features/home/components/TrustBar";
import Navbar from "@/src/layout/Navbar";
import Footer from "@/src/layout/Footer";

// Below-fold sections — dynamically imported for code splitting (separate JS chunks)
const NewsSection = dynamic(
  () => import("@/src/features/home/components/NewsSection")
);
const QuickCategories = dynamic(
  () => import("@/src/features/home/components/QuickCategories")
);
const ProductSection = dynamic(
  () => import("@/src/features/products/components/ProductSection")
);
const ArtOfWhite = dynamic(
  () => import("@/src/features/home/components/ArtOfWhite")
);
const FeaturedCollections = dynamic(
  () => import("@/src/features/home/components/FeaturedCollections")
);
const ArtisanSection = dynamic(
  () => import("@/src/features/home/components/ArtisanSection")
);
const BrandStory = dynamic(
  () => import("@/src/features/home/components/BrandStory")
);


// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero Banner */}
        <HeroSlider />
        {/* 2. Trust Bar */}
        <TrustBar />
        {/* 3. Tin tức mới nhất */}
        <NewsSection />
        {/* 4. Bạn đang cần tìm gì? */}
        <QuickCategories />
        {/* 5. Top sản phẩm nổi bật */}
        <ProductSection />
        {/* 6. Bộ sưu tập đặc sắc / Art of Fire */}
        <ArtOfWhite />
        <FeaturedCollections />
        {/* 7. Giới thiệu Nghệ nhân Bát Tràng (thay Quà tặng cao cấp) */}
        <ArtisanSection />
        {/* 8. Lịch sử làng nghề */}
        <BrandStory />
      </main>
      <Footer />
    </>
  );
}
