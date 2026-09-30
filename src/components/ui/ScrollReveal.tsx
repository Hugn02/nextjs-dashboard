"use client";

import React, { useEffect, useRef, useState } from "react";

export type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "scale-up";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  threshold?: number;
  className?: string;
  once?: boolean;
}

/**
 * ScrollReveal - Hiệu ứng chuyển động điện ảnh khi cuộn trang (Cinematic Scroll Reveal).
 * Sử dụng IntersectionObserver thuần siêu nhẹ (0 dependency, 60fps GPU acceleration).
 * Hỗ trợ hiệu ứng xuất hiện mượt mà cho hình ảnh, câu chuyện thương hiệu và chữ.
 */
export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 800,
  threshold = 0.12,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tôn trọng cài đặt giảm chuyển động của người dùng (Accessibility)
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const currentElem = domRef.current;
    if (!currentElem) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [threshold, once]);

  // Thiết lập class chuyển trạng thái theo từng kiểu animation
  const getTransformClasses = () => {
    switch (animation) {
      case "fade-up":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10";
      case "fade-down":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10";
      case "fade-left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-12";
      case "fade-right":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-12";
      case "zoom-in":
      case "scale-up":
        return isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95";
      default:
        return isVisible ? "opacity-100" : "opacity-0";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Đường cong giảm tốc siêu mượt
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
      className={`${className.includes("w-") ? "" : "w-full"} transition-all ${getTransformClasses()} ${className}`}
    >
      {children}
    </div>
  );
}
