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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: scrolled
                    ? "rgba(255,255,255,0.97)"
                    : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.3s ease",
                borderBottom: "1px solid rgba(180,150,100,0.15)",
                overflow: "visible",
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    background: "linear-gradient(90deg,#8b6914,#c4a84f,#8b6914)",
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 12,
                    letterSpacing: 2,
                    padding: "6px 0",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
            >
                ✦ NORITAKE VIETNAM — THƯƠNG HIỆU SỨ CAO CẤP SỐ 1 NHẬT BẢN ✦
            </div>

            {/* Main Navigation */}
            {/* Main Navigation */}
            <nav
                style={{
                    maxWidth: 1600,
                    margin: "0 auto",
                    padding: "0 32px",
                    display: "grid",
                    gridTemplateColumns: "220px 1fr 140px", // Logo | Menu | Icons
                    alignItems: "center",
                    columnGap: 32,
                    height: 88,
                }}
            >
                {/* Logo */}
                <a
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        textDecoration: "none",
                        width: "220px",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src="https://file.hstatic.net/200000296482/file/logo_1c90af075f3541399f3f74a35237f63c.png"
                        alt="Noritake Vietnam"
                        style={{
                            height: 54,
                            width: "auto",
                            objectFit: "contain",
                        }}
                    />
                </a>

                {/* Desktop Menu */}
                <div
                    className="nav-desktop"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 28,
                        minWidth: 0,
                    }}
                >
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                            }}
                            onMouseEnter={(e) => {
                                const dropdown = e.currentTarget.querySelector(
                                    ".dropdown-menu"
                                ) as HTMLElement | null;

                                if (dropdown) {
                                    dropdown.style.opacity = "1";
                                    dropdown.style.visibility = "visible";
                                    dropdown.style.transform = "translateY(0)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                const dropdown = e.currentTarget.querySelector(
                                    ".dropdown-menu"
                                ) as HTMLElement | null;

                                if (dropdown) {
                                    dropdown.style.opacity = "0";
                                    dropdown.style.visibility = "hidden";
                                    dropdown.style.transform = "translateY(10px)";
                                }
                            }}
                        >
                            {/* Menu cha */}
                            <a
                                href={item.href || "#"}
                                style={{
                                    color: "#3d2b00",
                                    textDecoration: "none",
                                    fontSize: 13,
                                    letterSpacing: 1,
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    lineHeight: 1.2,
                                    transition: "color 0.2s ease",
                                    padding: "32px 0",
                                }}
                                onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLElement).style.color = "#c4a84f")
                                }
                                onMouseLeave={(e) =>
                                    ((e.currentTarget as HTMLElement).style.color = "#3d2b00")
                                }
                            >
                                {item.label}
                            </a>

                            {/* Dropdown */}
                            {item.children && (
                                <div
                                    className="dropdown-menu"
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        minWidth: 280,
                                        background: "#ffffff",
                                        borderRadius: 4,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                        padding: "8px 0",
                                        opacity: 0,
                                        visibility: "hidden",
                                        transform: "translateY(10px)",
                                        transition: "all 0.25s ease",
                                        zIndex: 999,
                                    }}
                                >
                                    {item.children.map((child) => (
                                        <a
                                            key={child.label}
                                            href={child.href || "#"}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "14px 18px",
                                                color: "#4a4a4a",
                                                textDecoration: "none",
                                                fontSize: 16,
                                                fontFamily:
                                                    "'Cormorant Garamond', Georgia, serif",
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                transition: "background 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.background = "#f7f3eb";
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.background = "transparent";
                                            }}
                                        >
                                            <span>{child.label}</span>
                                            <span
                                                style={{
                                                    fontSize: 18,
                                                    color: "#666",
                                                }}
                                            >
                                                ›
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Icons */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 18,
                        width: "140px",
                        flexShrink: 0,
                    }}
                >
                    {/* Search */}
                    <button
                        onClick={() => setActiveModal(activeModal === "search" ? null : "search")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: activeModal === "search" ? 22 : 20,
                            color: activeModal === "search" ? "#c4a84f" : "#3d2b00",
                            transition: "all 0.3s ease",
                            transform: activeModal === "search" ? "rotate(90deg)" : "none",
                            width: 28,
                            textAlign: "center"
                        }}
                    >
                        {activeModal === "search" ? "✕" : "🔍"}
                    </button>

                    {/* User */}
                    <button
                        onClick={() => setActiveModal(activeModal === "user" ? null : "user")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: activeModal === "user" ? 22 : 20,
                            color: activeModal === "user" ? "#c4a84f" : "#3d2b00",
                            transition: "all 0.3s ease",
                            transform: activeModal === "user" ? "rotate(90deg)" : "none",
                            width: 28,
                            textAlign: "center"
                        }}
                    >
                        {activeModal === "user" ? "✕" : "👤"}
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => setActiveModal(activeModal === "cart" ? null : "cart")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: activeModal === "cart" ? 22 : 20,
                            color: activeModal === "cart" ? "#c4a84f" : "#3d2b00",
                            transition: "all 0.3s ease",
                            transform: activeModal === "cart" ? "rotate(90deg)" : "none",
                            position: "relative",
                            width: 28,
                            textAlign: "center"
                        }}
                    >
                        {activeModal === "cart" ? "✕" : "🛒"}
                        {activeModal !== "cart" && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: -6,
                                    right: -8,
                                    background: "#c4a84f",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    width: 16,
                                    height: 16,
                                    fontSize: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                }}
                            >
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