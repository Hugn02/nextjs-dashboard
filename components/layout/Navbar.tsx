"use client";
import { useState, useEffect } from "react";
import SearchModal from "@/components/home/SearchModal";
import UserModal from "@/components/home/UserModal";
import CartModal from "@/components/home/CartModal";

type SubMenuItem = {
  label: string;
  href?: string;
};

type MenuItem = {
  label: string;
  href?: string;
  children?: SubMenuItem[];
};

const menuItems: MenuItem[] = [
  {
    label: "Bộ sưu tập",
    children: [
      { label: "Sứ xương", href: "#" },
      { label: "Sứ trắng cao cấp", href: "#" },
      { label: "Sứ trắng", href: "#" },
      { label: "Sứ tái chế (Made in Japan)", href: "#" },
      { label: "Pha lê - Thủy tinh", href: "#" },
      { label: "Gỗ sơn mài", href: "#" },
      { label: "Thép không gỉ", href: "#" },
    ],
  },
  {
    label: "Loại sản phẩm",
    children: [
      { label: "Bộ bát đĩa", href: "#" },
      { label: "Bộ ấm trà", href: "#" },
      { label: "Cốc / Ly sứ", href: "#" },
      { label: "Bình hoa", href: "#" },
    ],
  },
  {
    label: "Chức năng",
    children: [
      { label: "Dùng hàng ngày", href: "#" },
      { label: "Trang trí", href: "#" },
      { label: "Quà tặng", href: "#" },
    ],
  },
  {
    label: "Quà tặng",
    children: [
      { label: "Quà cưới", href: "#" },
      { label: "Quà tân gia", href: "#" },
      { label: "Quà sinh nhật", href: "#" },
    ],
  },
  {
    label: "Khách hàng doanh nghiệp",
    children: [
      { label: "Quà tặng doanh nghiệp", href: "#" },
      { label: "In logo theo yêu cầu", href: "#" },
    ],
  },
  { label: "Gift Voucher", href: "#" },
  { label: "Tin tức", href: "#" },
  { label: "Về chúng tôi", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "search" | "user" | "cart" | null
  >(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa để thay đổi trạng thái icon
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [activeModal]); // Re-check mỗi khi modal đóng/mở

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] backdrop-blur-xl transition-all duration-300 border-b border-[#b49664]/15 overflow-visible 
            ${scrolled ? "bg-white/97 shadow-lg" : "bg-white/92 shadow-none"}`}
    >
      <div className="bg-gradient-to-r from-[#8b6914] via-[#c4a84f] to-[#8b6914] text-white text-center text-[12px] tracking-[2px] py-1.5 font-['Cormorant_Garamond',_serif]">
        ✦ NORITAKE VIETNAM — THƯƠNG HIỆU SỨ CAO CẤP SỐ 1 NHẬT BẢN ✦
      </div>

      <nav className="max-w-[1600px] mx-auto px-8 grid grid-cols-[220px_1fr_140px] items-center gap-8 h-[88px]">
        <a
          href="/"
          className="flex items-center justify-start no-underline w-[220px] shrink-0"
        >
          <img
            src="https://file.hstatic.net/200000296482/file/logo_1c90af075f3541399f3f74a35237f63c.png"
            alt="Noritake Vietnam"
            className="h-[54px] w-auto object-contain"
          />
        </a>

        <div className="flex items-center justify-center gap-7 min-w-0">
          {menuItems.map((item) => (
            <div key={item.label} className="group relative flex items-center">
              <a
                href={item.href || "#"}
                className="text-[#3d2b00] no-underline text-[13px] tracking-[1px] font-['Cormorant_Garamond',_serif] font-semibold uppercase whitespace-nowrap shrink-0 leading-[1.2] py-8 transition-colors hover:text-[#c4a84f]"
              >
                {item.label}
              </a>

              {item.children && (
                <div className="absolute top-full left-0 min-w-[280px] bg-white rounded shadow-xl py-2 opacity-0 invisible translate-y-2.5 transition-all duration-[250ms] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-[999]">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href || "#"}
                      className="flex items-center justify-between px-[18px] py-3.5 text-[#4a4a4a] no-underline text-base font-['Cormorant_Garamond',_serif] font-medium whitespace-nowrap transition-colors hover:bg-[#f7f3eb]"
                    >
                      <span>{child.label}</span>
                      <span className="text-lg text-[#666]">›</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-[18px] w-[140px] shrink-0">
          <button
            onClick={() =>
              setActiveModal(activeModal === "search" ? null : "search")
            }
            className={`bg-none border-none cursor-pointer w-7 text-center transition-all duration-300 ${activeModal === "search" ? "text-2xl text-[#c4a84f] rotate-90" : "text-[20px] text-[#3d2b00]"}`}
          >
            {activeModal === "search" ? "✕" : "🔍"}
          </button>

          <button
            onClick={() =>
              setActiveModal(activeModal === "user" ? null : "user")
            }
            className={`bg-none border-none cursor-pointer w-7 text-center transition-all duration-300 ${activeModal === "user" ? "text-2xl text-[#c4a84f] rotate-90" : isLoggedIn ? "text-[20px] text-[#c4a84f]" : "text-[20px] text-[#3d2b00]"}`}
            title={isLoggedIn ? "Tài khoản của tôi" : "Đăng nhập"}
          >
            {activeModal === "user" ? "✕" : isLoggedIn ? "👤" : "👤"}
          </button>

          <button
            onClick={() =>
              setActiveModal(activeModal === "cart" ? null : "cart")
            }
            className={`relative bg-none border-none cursor-pointer w-7 text-center transition-all duration-300 ${activeModal === "cart" ? "text-2xl text-[#c4a84f] rotate-90" : "text-[20px] text-[#3d2b00]"}`}
          >
            {activeModal === "cart" ? "✕" : "🛒"}
            {activeModal !== "cart" && (
              <span className="absolute -top-1.5 -right-2 bg-[#c4a84f] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                0
              </span>
            )}
          </button>
        </div>
      </nav>
      {activeModal === "search" && (
        <SearchModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "user" && (
        <UserModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "cart" && (
        <CartModal onClose={() => setActiveModal(null)} />
      )}
    </header>
  );
}
