"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
          <Image
            src="/assets/logo2.png"
            alt="Bát Tràng"
            width={120}
            height={40}
            className="h-8 md:h-10 w-auto mb-4"
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
                <Image
                  src={social.src}
                  alt={social.alt}
                  width={20}
                  height={20}
                  className="object-contain"
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>

        {/* Column 1: Sản phẩm */}
        <div className="text-left">
          <h4 className="text-[12px] tracking-[2px] text-[#c4a84f] uppercase mb-4">
            Sản phẩm
          </h4>
          <ul className="list-none p-0 m-0">
            {[
              { label: "Bình Hoa", href: "/categories/binh-hoa" },
              { label: "Ấm Trà", href: "/categories/am-tra" },
              { label: "Chén Trà", href: "/categories/chen-tra" },
              { label: "Tống Trà", href: "/categories/tong-tra" },
              { label: "Dĩa Trà", href: "/categories/dam-tra" },
              { label: "Tất cả sản phẩm", href: "/products/all" },
            ].map((link) => (
              <li key={link.label} className="mb-2">
                <a
                  href={link.href}
                  className="text-[#a08060] no-underline text-[13px] transition-colors hover:text-[#c4a84f]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Hỗ trợ */}
        <div className="text-left">
          <h4 className="text-[12px] tracking-[2px] text-[#c4a84f] uppercase mb-4">
            Hỗ trợ
          </h4>
          <ul className="list-none p-0 m-0">
            {[
              { label: "Chính sách đổi trả", href: "/support#doi-tra" },
              { label: "Chính sách giao hàng", href: "/support#giao-hang" },
              { label: "Hướng dẫn mua hàng", href: "/support#huong-dan" },
              { label: "Hệ thống cửa hàng", href: "/support#cua-hang" },
            ].map((link) => (
              <li key={link.label} className="mb-2">
                <a
                  href={link.href}
                  className="text-[#a08060] no-underline text-[13px] transition-colors hover:text-[#c4a84f]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Liên hệ (Hiển thị thông tin tĩnh, không dùng thẻ link) */}
        <div className="text-left">
          <h4 className="text-[12px] tracking-[2px] text-[#c4a84f] uppercase mb-4">
            Liên hệ
          </h4>
          <ul className="list-none p-0 m-0 space-y-2.5 text-[13px] text-[#a08060]">
            <li className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>0901 234 567</span>
            </li>
            <li className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>info@battrang.vn</span>
            </li>
            <li className="flex items-start gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Làng gốm Bát Tràng, Hà Nội</span>
            </li>
            <li className="flex items-start gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c4a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>456 Nguyễn Văn Linh, Q.7, TP.HCM</span>
            </li>
          </ul>
        </div>
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
