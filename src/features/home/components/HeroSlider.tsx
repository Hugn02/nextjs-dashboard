"use client";

import { useState, useEffect } from "react";

const HERO_SLIDES = [
  {
    id: 1,
    image:
      "https://cdn.hstatic.net/files/200000296482/file/cuu-ngu.jpg",
    href: "https://noritake.vn/collections/summer-living-sale-of-12",
    alt: "Summer Living Sale",
  },
  {
    id: 2,
    image:
      "https://theme.hstatic.net/200000296482/1001063914/14/slideshow_3.jpg?v=5943",
    href: "https://noritake.vn/collections/flared-vase-limited-collection",
    alt: "Bình Tài Lộc 2025",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hidden md:block relative w-full h-[min(640px,72vh)] overflow-hidden mt-[120px]">
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-900 ease-in-out cursor-pointer 
                        ${i === current ? "opacity-100" : "opacity-0"}`}
          onClick={() => window.open(slide.href, "_blank")}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e0f00]/35 to-transparent" />
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0 
                            ${i === current ? "w-8 bg-[#c4a84f]" : "w-2 bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
}
