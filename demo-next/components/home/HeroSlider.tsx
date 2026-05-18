"use client";

import { useState, useEffect } from "react";

const HERO_SLIDES = [
    {
        id: 1,
        image: "https://theme.hstatic.net/200000296482/1001063914/14/slideshow_2.jpg?v=5943",
        href: "https://noritake.vn/collections/summer-living-sale-of-12",
        alt: "Summer Living Sale",
    },
    {
        id: 2,
        image: "https://theme.hstatic.net/200000296482/1001063914/14/slideshow_3.jpg?v=5943",
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
        <section
            style={{
                position: "relative",
                width: "100%",
                height: "min(640px, 72vh)",
                overflow: "hidden",
                marginTop: 120,
            }}
        >
            {HERO_SLIDES.map((slide, i) => (
                <div
                    key={slide.id}
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: i === current ? 1 : 0,
                        transition: "opacity 0.9s ease",
                        cursor: "pointer",
                    }}
                    onClick={() => window.open(slide.href, "_blank")}
                >
                    <img
                        src={slide.image}
                        alt={slide.alt}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                    />
                    {/* Overlay gradient */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to right, rgba(30,15,0,0.35) 0%, transparent 60%)",
                        }}
                    />
                </div>
            ))}

            {/* Slide indicators */}
            <div
                style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 8,
                }}
            >
                {HERO_SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            width: i === current ? 32 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: i === current ? "#c4a84f" : "rgba(255,255,255,0.6)",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            padding: 0,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}