import ArtOfWhite from "@/src/features/home/components/ArtOfWhite";
import BrandStory from "@/src/features/home/components/BrandStory";
import FeaturedCollections from "@/src/features/home/components/FeaturedCollections";
import GiftSection from "@/src/features/home/components/GiftSection";
import HeroSlider from "@/src/features/home/components/HeroSlider";
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
        <HeroSlider />
        <TrustBar />
        <QuickCategories />
        <ProductSection />
        <ArtOfWhite />
        <FeaturedCollections />
        <BrandStory />
        <GiftSection />
      </main>
      <Footer />
    </>
  );
}
