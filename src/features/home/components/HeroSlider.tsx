"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets/slide1.png",
    alt: "Bộ sưu tập Cửu Ngư",
  },
  {
    id: 2,
    image: "/assets/slide2.png",
    alt: "Bình Tài Lộc 2026",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      className="group relative w-full aspect-[16/8] sm:aspect-[16/6.5] lg:aspect-auto lg:h-[min(640px,72vh)] overflow-hidden mt-[88px] md:mt-[120px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-900 ease-in-out 
                        ${i === current ? "opacity-100 z-0" : "opacity-0 -z-10"}`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority={i === 0}
          />
          {/* Subtle vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      ))}

      {/* Navigation Arrow - Left */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 hover:bg-[#c4a84f] hover:border-[#c4a84f] hover:scale-110 shadow-lg cursor-pointer"
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
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 hover:bg-[#c4a84f] hover:border-[#c4a84f] hover:scale-110 shadow-lg cursor-pointer"
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

      {/* Dots Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 z-20 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0 
                            ${i === current ? "w-7 sm:w-9 bg-[#c4a84f] shadow-[0_0_8px_rgba(196,168,79,0.8)]" : "w-2 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
