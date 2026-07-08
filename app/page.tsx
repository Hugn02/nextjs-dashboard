import ArtOfWhite from "@/src/features/home/components/ArtOfWhite";
import ArtisanSection from "@/src/features/home/components/ArtisanSection";
import BrandStory from "@/src/features/home/components/BrandStory";
import FeaturedCollections from "@/src/features/home/components/FeaturedCollections";
import HeroSlider from "@/src/features/home/components/HeroSlider";
import NewsSection from "@/src/features/home/components/NewsSection";
import QuickCategories from "@/src/features/home/components/QuickCategories";
import TrustBar from "@/src/features/home/components/TrustBar";
import ProductSection from "@/src/features/products/components/ProductSection";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";


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
