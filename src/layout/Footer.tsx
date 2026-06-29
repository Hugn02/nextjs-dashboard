"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="bg-[#1a0d00] text-[#d4b896] pt-[60px] pb-8 border-t-2 border-[#c4a84f]">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-x-5 gap-y-10">
        <div className="flex flex-col items-start text-left">
          <img
            src="/assets/logo.png"
            alt="Bát Tràng"
            className="h-8 md:h-10 mb-4"
          />
          <p className="text-[11px] md:text-[13px] leading-[1.6] md:leading-[1.8] text-[#a08060] mb-4">
            Website chính thức của Bát Tràng tại Việt Nam — Thương hiệu sứ cao
            cấp danh tiếng số 1 Việt Nam.
          </p>
          <div className="flex gap-3 mt-2 md:mt-5">
            {[
              {
                src: "https://file.hstatic.net/200000296482/file/instagram_-_footer_d01f0a0d01324ee0b54dda8d829a9ecc_small.png",
                alt: "Facebook",
                href: "#",
              },
              {
                src: "https://file.hstatic.net/200000296482/file/zalo_-_footer_d622bdb0640c465ea6fd753d0a985bf1_small.png",
                alt: "Instagram",
                href: "#",
              },
              {
                src: "https://file.hstatic.net/200000296482/file/youtube_-_footer_91ab502f46b34d4e9377dfdcfddd1024_small.png",
                alt: "YouTube",
                href: "#",
              },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#c4a84f]/15 border border-[#c4a84f]/30 transition-colors hover:bg-[#c4a84f]/30"
              >
                <img
                  src={social.src}
                  alt={social.alt}
                  className="w-3/5 h-3/5 object-contain"
                />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            title: "Sản phẩm",
            links: [
              "Bộ ấm trà cao cấp",
              "Bộ bát đĩa",
              "Cốc sứ",
              "Bình hoa",
              "Quà tặng",
            ],
          },
          {
            title: "Hỗ trợ",
            links: [
              "Chính sách đổi trả",
              "Giao hàng",
              "Hướng dẫn mua hàng",
              "Hệ thống cửa hàng",
            ],
          },
          {
            title: "Liên hệ",
            links: [
              "📞 0901 234 567",
              "✉️ info@battrang.vn",
              "📍 TP. Hồ Chí Minh",
              "📍 Hà Nội",
            ],
          },
        ].map((col) => (
          <div key={col.title} className="text-left">
            <h4 className="text-[12px] tracking-[2px] text-[#c4a84f] uppercase mb-4">
              {col.title}
            </h4>
            <ul className="list-none p-0 m-0">
              {col.links.map((link) => (
                <li key={link} className="mb-2">
                  <a
                    href="#"
                    className="text-[#a08060] no-underline text-[13px] transition-colors hover:text-[#c4a84f]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-[1280px] mx-auto mt-10 pt-5 px-6 border-t border-[#c4a84f]/15 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <p className="text-[13px] md:text-[15px] text-[#a08060] m-0">
          © 2026 Bát Tràng Vietnam. All rights reserved.
        </p>
        <p className="text-[13px] md:text-[15px] text-[#a08060] m-0">
          Thương hiệu sứ cao cấp số 1 Việt Nam
        </p>
      </div>

      <div className="fixed bottom-24 right-6 md:bottom-28 md:right-[33px] z-[99]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`w-[40px] h-[40px] md:w-[46px] md:h-[46px] rounded-full bg-[#c4a84f] text-white border-none cursor-pointer items-center justify-center text-xl shadow-lg transition-all duration-300 hover:bg-[#a8893a] 
                      ${showScrollTop ? "flex opacity-100" : "hidden opacity-0"}`}
        >
          ↑
        </button>
      </div>
    </footer>
  );
}
