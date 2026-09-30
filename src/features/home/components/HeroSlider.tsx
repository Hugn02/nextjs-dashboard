"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets/slide1.png",
    alt: "Bộ sưu tập Cửu Ngư - Tinh hoa gốm Việt",
    subtitle: "Lưu giữ văn hóa • Nâng tầm không gian sống",
  },
  {
    id: 2,
    image: "/assets/slide2.png",
    alt: "Bình Tài Lộc 2026 - Di sản Bát Tràng",
    subtitle: "Nghệ thuật men hỏa biến • Độc bản thủ công",
  },
];

const SLIDE_DURATION = 5500; // 5.5 giây mỗi slide

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const prevSlide = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [isPaused, nextSlide]);

  // Touch handlers cho thao tác vuốt trên điện thoại
  const minSwipeDistance = 45;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  return (
    <section
      className="group relative w-full aspect-[16/8] sm:aspect-[16/6.5] lg:aspect-auto lg:h-[min(640px,72vh)] overflow-hidden mt-[88px] md:mt-[120px] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Banner quảng bá tinh hoa gốm Bát Tràng"
    >
      {HERO_SLIDES.map((slide, i) => {
        const isActive = i === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            {/* Ảnh nền với hiệu ứng Ken Burns zoom chậm rãi */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                className={`object-cover object-top transition-transform duration-[6500ms] ease-out will-change-transform ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                priority={i === 0}
              />
            </div>

            {/* Lớp phủ điện ảnh: Vignette + gradient ấm cúng */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/35 pointer-events-none" />
          </div>
        );
      })}

      {/* Navigation Arrow - Left */}
      <button
        onClick={prevSlide}
        aria-label="Xem slide trước"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-0 group-hover:opacity-100 hover:bg-[#c4a84f] hover:border-[#c4a84f] hover:scale-110 shadow-lg cursor-pointer active:scale-95"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Navigation Arrow - Right */}
      <button
        onClick={nextSlide}
        aria-label="Xem slide kế tiếp"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-0 group-hover:opacity-100 hover:bg-[#c4a84f] hover:border-[#c4a84f] hover:scale-110 shadow-lg cursor-pointer active:scale-95"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </section>
  );
}
