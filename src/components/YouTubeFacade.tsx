"use client";

import { useState } from "react";

interface YouTubeFacadeProps {
  videoId: string;
  title?: string;
  className?: string;
}

/**
 * YouTubeFacade — Lazy load YouTube iframe.
 * - Hiển thị thumbnail tĩnh thay vì tải iframe ngay khi load trang
 * - Chỉ load iframe thực sự khi user nhấn nút Play
 * - Dùng youtube-nocookie.com để tránh đặt tracking cookies (cải thiện Best Practices)
 */
export default function YouTubeFacade({ videoId, title = "Video player", className = "" }: YouTubeFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  if (isPlaying) {
    return (
      <iframe
        className={`w-full h-full rounded-[2px] ${className}`}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className="group relative w-full h-full cursor-pointer border-none p-0 bg-transparent"
      aria-label={`Phát video: ${title}`}
    >
      {/* Thumbnail — dùng <img> thường vì YouTube CDN đã tối ưu sẵn */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          // Fallback sang hqdefault nếu maxresdefault không tồn tại
          (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-300" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-2xl flex items-center justify-center">
          {/* YouTube play icon shape */}
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 md:w-9 md:h-9 text-[#c4a84f] translate-x-0.5"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
