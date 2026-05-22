"use client";


import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/home/HeroSlider";
import TrustBar from "@/components/home/TrustBar";
import QuickCategories from "@/components/home/QuickCategories";
import ProductSection from "@/components/home/ProductSection";
import ArtOfWhite from "@/components/home/ArtOfWhite";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import BrandStory from "@/components/home/BrandStory";
import GiftSection from "@/components/home/GiftSection";

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* Import Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          font-family: 'Cormorant Garamond', Georgia, serif;
          background: #fff;
          color: #2c1a00;
          -webkit-font-smoothing: antialiased;
        }
        
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #faf7f2; }
        ::-webkit-scrollbar-thumb { background: #c4a84f; border-radius: 3px; }
      `}</style>

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
