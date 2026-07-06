"use client";
import { useState, useEffect } from "react";
import UserModal from "../features/auth/components/UserModal";
import CartModal from "../features/cart/components/CartModal";
import SearchModal from "../features/search/components/SearchModal";

type Category = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

type SubMenuItem = {
  label: string;
  href?: string;
};

type MenuItem = {
  label: string;
  href?: string;
  children?: SubMenuItem[];
};

const initialMenuItems: MenuItem[] = [
  {
    label: "Bộ sưu tập",
    children: [], // Sẽ được điền dữ liệu từ API
  },
  {
    label: "Loại sản phẩm",
    children: [], // Sẽ được điền dữ liệu từ API
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Effect để lấy dữ liệu menu (chỉ chạy một lần khi component mount)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?isActive=true`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const response = await res.json();
        const categories: Category[] = Array.isArray(response) ? response : (response.data?.categories || response.data || []);
        if (!Array.isArray(categories)) throw new Error("Dữ liệu categories trả về không phải là một mảng.");
        const activeCategories = categories.filter((cat) => cat.isActive !== false);
        const categoryChildren: SubMenuItem[] = activeCategories.map((cat) => ({
          label: cat.name,
          href: `/categories/${cat.slug}`
        }));
        setMenuItems(prevItems => {
          const newItems = [...prevItems];
          const productTypeIndex = newItems.findIndex(item => item.label === "Loại sản phẩm");
          if (productTypeIndex !== -1) {
            newItems[productTypeIndex] = { ...newItems[productTypeIndex], children: categoryChildren };
          }
          return newItems;
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh mục sản phẩm:", error instanceof Error ? error.message : error);
      }
    };

    const fetchCollections = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections?isActive=true`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const response = await res.json();
        const collections: Category[] = Array.isArray(response) ? response : (response.data || []);
        const collectionChildren: SubMenuItem[] = collections.map((col) => ({ label: col.name, href: `/collections/${col.slug}` }));
        setMenuItems(prevItems => prevItems.map(item => item.label === "Bộ sưu tập" ? { ...item, children: collectionChildren } : item));
      } catch (error) {
        console.error("Lỗi khi lấy bộ sưu tập:", error instanceof Error ? error.message : error);
      }
    };

    const fetchFunctions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/functions?isActive=true`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const response = await res.json();
        const functions: Category[] = Array.isArray(response) ? response : (response.data || []);
        const functionChildren: SubMenuItem[] = functions.map((func) => ({
          label: func.name,
          href: `/functions/${func.slug}`
        }));
        setMenuItems(prevItems => prevItems.map(item => item.label === "Chức năng" ? { ...item, children: functionChildren } : item));
      } catch (error) {
        console.error("Lỗi khi lấy chức năng:", error instanceof Error ? error.message : error);
      }
    };

    fetchCategories();
    fetchCollections();
    fetchFunctions();
  }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần

  useEffect(() => {
    // Effect này chỉ để kiểm tra lại trạng thái đăng nhập khi modal thay đổi
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [activeModal]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[100] backdrop-blur-xl transition-all duration-300 border-b border-[#b49664]/15 overflow-visible 
            ${scrolled ? "bg-white shadow-lg" : "bg-white/92 shadow-none"}`}
      >
        <div className="bg-gradient-to-r from-[#8b6914] via-[#c4a84f] to-[#8b6914] text-white text-center text-[10px] md:text-[12px] tracking-[1px] md:tracking-[2px] py-1.5 font-['Cormorant_Garamond',_serif] px-4">
          ✦ NGHỆ NHÂN BÁT TRÀNG — CHUYÊN NUNG CỦI ✦
        </div>

        <nav className="max-w-[1600px] mx-auto px-4 md:px-8 flex lg:grid lg:grid-cols-[220px_1fr_140px] items-center justify-between gap-4 md:gap-8 h-[60px] md:h-[88px]">
          {/* Nút Hamburger cho Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-[#3d2b00] text-2xl bg-transparent border-none cursor-pointer p-0 w-8"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>

          <a
            href="/"
            className="flex items-center justify-center lg:justify-start no-underline lg:w-[220px] shrink-0"
          >
            <img
              src="/assets/logo.png"
              alt="Bát Tràng"
              className="h-[36px] md:h-[54px] w-auto object-contain"
            />
          </a>

          {/* Menu Desktop - Ẩn trên Mobile */}
          <div className="hidden lg:flex items-center justify-center gap-7 min-w-0">
            {menuItems.map((item) => (
              <div key={item.label} className="group relative flex items-center">
                {item.children ? (
                  <span className="text-[#3d2b00] cursor-default text-[13px] tracking-[1px] font-['Cormorant_Garamond',_serif] font-semibold uppercase whitespace-nowrap shrink-0 leading-[1.2] py-8 transition-colors hover:text-[#c4a84f]">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href || "#"}
                    className="text-[#3d2b00] no-underline text-[13px] tracking-[1px] font-['Cormorant_Garamond',_serif] font-semibold uppercase whitespace-nowrap shrink-0 leading-[1.2] py-8 transition-colors hover:text-[#c4a84f]"
                  >
                    {item.label}
                  </a>
                )}

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

          <div className="flex items-center justify-end gap-3 md:gap-[18px] lg:w-[140px] shrink-0">
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
      </header>

      {/* Overlay Menu cho Mobile */}
      <div
        className={`lg:hidden fixed inset-0 top-[88px] bg-white z-[110] transition-all duration-300 transform ${isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          } overflow-y-auto ${isMobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"} shadow-2xl`}
        style={{
          top: '88px'
        }}
      >
        <div className="flex flex-col p-6 pb-32 gap-1 min-h-full bg-white relative">
          {menuItems.map((item) => (
            <div key={item.label} className="border-b border-[#b49664]/10 last:border-none py-4">
              <div className="flex justify-between items-center mb-2">
                {item.children ? (
                  <span className="text-[#3d2b00] text-base font-bold uppercase tracking-widest font-['Cormorant_Garamond',_serif] block w-full">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href || "#"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#3d2b00] no-underline text-base font-bold uppercase tracking-widest font-['Cormorant_Garamond',_serif] block w-full"
                  >
                    {item.label}
                  </a>
                )}
              </div>
              {item.children && (
                <div className="flex flex-col gap-4 pl-4 mt-4 border-l border-[#c4a84f]/20">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href || "#"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[#666] no-underline text-sm font-['Cormorant_Garamond',_serif] hover:text-[#c4a84f] transition-colors"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="py-12 text-center text-[10px] tracking-[3px] text-[#c4a84f] font-bold uppercase opacity-50">
            ✦ Bát Tràng Vietnam ✦
          </div>
        </div>
      </div>

      {activeModal === "search" && (
        <SearchModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "user" && (
        <UserModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "cart" && (
        <CartModal onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
