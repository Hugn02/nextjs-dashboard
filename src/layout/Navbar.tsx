"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import UserModal from "../features/auth/components/UserModal";
import CartModal from "../features/cart/components/CartModal";
import SearchModal from "../features/search/components/SearchModal";
import useCart from "../features/cart/hooks/useCart";

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
    children: [], // Sẽ được điền dữ liệu từ API
  },

  { label: "Tin tức", href: "/news" },
  { label: "Khách hàng doanh nghiệp", href: "/business" },
  { label: "Về chúng tôi", href: "/about" },
];

export default function Navbar() {
  const { cartCount } = useCart();
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
            <Image
              src="/assets/logo2.png"
              alt="Bát Tràng"
              width={160}
              height={54}
              className="h-[36px] md:h-[54px] w-auto object-contain"
              priority
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
                        className="flex items-center px-[18px] py-3.5 text-[#4a4a4a] no-underline text-base font-['Cormorant_Garamond',_serif] font-medium whitespace-nowrap transition-colors hover:bg-[#f7f3eb]"
                      >
                        <span>{child.label}</span>
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
              title="Tìm kiếm"
              className={`bg-transparent border-none cursor-pointer p-0 flex items-center justify-center w-7 h-7 text-[#3d2b00] transition-all duration-300 hover:text-[#c4a84f] ${activeModal === "search" ? "text-[#c4a84f] rotate-90" : ""}`}
            >
              {activeModal === "search" ? (
                <span className="text-2xl">✕</span>
              ) : (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="m21 20.152-5.348-5.348a6.56 6.56 0 0 0 1.529-4.214A6.597 6.597 0 0 0 10.59 4 6.597 6.597 0 0 0 4 10.59a6.597 6.597 0 0 0 6.59 6.59 6.56 6.56 0 0 0 4.215-1.528L20.152 21zM5.2 10.59a5.4 5.4 0 0 1 5.391-5.392 5.4 5.4 0 0 1 5.392 5.392 5.4 5.4 0 0 1-5.392 5.392A5.4 5.4 0 0 1 5.2 10.59"></path>
                </svg>
              )}
            </button>

            <button
              onClick={() =>
                setActiveModal(activeModal === "user" ? null : "user")
              }
              className={`bg-transparent border-none cursor-pointer p-0 flex items-center justify-center w-7 h-7 text-[#3d2b00] transition-all duration-300 hover:text-[#c4a84f] ${activeModal === "user" ? "text-[#c4a84f] rotate-90" : ""} ${isLoggedIn ? "" : ""}`}
              title={isLoggedIn ? "Tài khoản của tôi" : "Đăng nhập"}
            >
              {activeModal === "user" ? (
                <span className="text-2xl">✕</span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 488.9 488.9" xmlSpace="preserve">
                  <g>
                    <path fill="currentColor" d="M477.7,454.8v-26c0-26.5-12.4-52-33.1-68.1c-48.2-37.4-97.3-63.5-114.5-72.2v-29.7c3.5-7.8,6.4-16.3,8.6-25.5   c12.8-4.6,19.8-23.4,24.5-40c6.3-22.1,5.6-37.6-1.8-46.2c7.8-42.5,4.3-73.8-10.3-93.1c-7.7-10.1-16.7-14.4-22.7-16.3   c-4.3-6-13-16.1-27.7-24.2C285.5,4.5,268.4,0,249.6,0c-3.4,0-6.8,0.2-9.8,0.4c-8.4,0.4-16.7,2-24.9,4.7c-0.1,0-0.2,0.1-0.3,0.1   c-9,3.1-17.8,7.6-26.3,13.4c-9.7,6.2-18.6,13.6-26.3,21.8c-15.1,15.5-25.1,33-29.4,51.7c-4.1,15.5-4.4,31.1-1,46.4   c-1.8,1.3-3.4,2.8-4.8,4.6c-6.9,9.1-7.2,23.4-1.1,45.1c4.2,15,9.8,30.3,19.3,37.2c2.8,14.4,7.5,27.5,13.8,39.1v24.1   c-17.2,8.7-66.3,34.7-114.5,72.2c-20.7,16.1-33.1,41.5-33.1,68.1v26c0,18.8,15.3,34,34,34h398.5   C462.4,488.9,477.7,473.6,477.7,454.8z M35.6,454.8v-26c0-19,8.8-37.2,23.6-48.7c52-40.3,104.9-66.9,115-71.8   c5.6-2.7,9.1-8.3,9.1-14.6v-32.5c0-2.2-0.6-4.3-1.7-6.2c-6.6-11.2-11.2-24.6-13.5-39.9c-0.8-4.9-4.4-8.8-9.1-10   c-1.3-1.5-5-6.9-9.7-23.6c-3.9-13.8-3.6-20.2-3.2-22.5c3.9,0.2,7.8-1.6,10.3-4.7c2.6-3.3,3.3-7.7,1.9-11.6   c-5.2-14.5-5.8-29.4-1.8-44.6c3.4-14.6,11.2-28.2,23.3-40.6c6.5-7,14-13.1,22-18.2c0.1-0.1,0.3-0.2,0.4-0.3   c6.7-4.7,13.7-8.2,20.6-10.6c0.1,0,0.2-0.1,0.2-0.1c5.9-2,12-3.1,18.4-3.4c17.5-1.5,33.2,1.8,47.1,9.9   c15.2,8.4,21.4,19.4,21.4,19.4c1.9,3.9,5.3,6.2,9.7,6.5c0.3,0,6.8,1,12.4,8.9c5.9,8.4,14.3,30,3.8,80.4c-1.2,5.6,1.7,11.2,6.8,13.6   c0.5,1.8,1.3,7.9-3,23.1c-3.8,13.4-6.9,19.5-8.7,22.2c-2.3-0.4-4.7-0.2-6.9,0.8c-3.8,1.6-6.6,5.1-7.3,9.1c-2.1,12-5.5,22.8-9.9,32   c-0.8,1.7-1.2,3.5-1.2,5.3v37.6c0,6.3,3.5,11.8,9.1,14.6c10.1,4.9,63,31.6,114.9,71.8c14.8,11.5,23.6,29.7,23.6,48.7v26   c0,5.2-4.3,9.5-9.5,9.5H45.2C39.9,464.4,35.6,460.1,35.6,454.8z"></path>
                  </g>
                </svg>
              )}
            </button>

            <button
              onClick={() =>
                setActiveModal(activeModal === "cart" ? null : "cart")
              }
              title="Giỏ hàng"
              className={`relative bg-transparent border-none cursor-pointer p-0 flex items-center justify-center w-7 h-7 text-[#3d2b00] transition-all duration-300 hover:text-[#c4a84f] ${activeModal === "cart" ? "text-[#c4a84f] rotate-90" : ""}`}
            >
              {activeModal === "cart" ? (
                <span className="text-2xl">✕</span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 22 24">
                  <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M14.622,17.984v-1.791c0-1.353,1.097-2.45,2.45-2.45s2.45,1.097,2.45,2.45v1.947"></path>
                  <line fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="3.563" y1="21.844" x2="11.172" y2="21.844"></line>
                  <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M13.101,7.719V4.653c0-2.087-1.692-3.78-3.78-3.78c-2.087,0-3.779,1.692-3.779,3.78v3.066"></path>
                  <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M3.513,21.844c-1.34,0-2.427-1.087-2.427-2.427l0.184-2.167L2.322,5.179h14l0.569,6.306"></path>
                  <path fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M20.854,23.141h-7.56c-0.055,0-0.1-0.045-0.1-0.1v-4.8c0-0.055,0.045-0.1,0.1-0.1h7.56c0.055,0,0.1,0.045,0.1,0.1v4.8 C20.954,23.096,20.909,23.141,20.854,23.141z"></path>
                </svg>
              )}
              {activeModal !== "cart" && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#c4a84f] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
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
