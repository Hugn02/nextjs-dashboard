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
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        <div>
          <img
            src="https://file.hstatic.net/200000296482/file/logo_1c90af075f3541399f3f74a35237f63c.png"
            alt="Noritake"
            className="h-10 mb-4"
          />
          <p className="text-[13px] leading-[1.8] text-[#a08060] mb-5 max-w-[280px]">
            Website chính thức của Noritake tại Việt Nam — Thương hiệu sứ cao
            cấp danh tiếng số 1 Nhật Bản.
          </p>
          <div className="flex gap-3 mt-5">
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
              "✉️ info@noritake.vn",
              "📍 TP. Hồ Chí Minh",
              "📍 Hà Nội",
            ],
          },
        ].map((col) => (
          <div key={col.title}>
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

      <div className="max-w-[1280px] mx-auto mt-10 pt-5 px-6 border-t border-[#c4a84f]/15 flex justify-between flex-wrap gap-2">
        <p className="text-[15px] text-[#a08060] m-0">
          © 2026 Noritake Vietnam. All rights reserved.
        </p>
        <p className="text-[15px] text-[#a08060] m-0">
          Thương hiệu sứ cao cấp số 1 Nhật Bản
        </p>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-28 right-[33px] w-[46px] h-[46px] rounded-full bg-[#c4a84f] text-white border-none cursor-pointer items-center justify-center text-xl shadow-lg z-[99] transition-all duration-300 hover:bg-[#a8893a] 
                    ${showScrollTop ? "flex opacity-100" : "hidden opacity-0"}`}
      >
        ↑
      </button>
    </footer>
  );
}
