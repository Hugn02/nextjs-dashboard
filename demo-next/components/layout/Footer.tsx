import { useState, useEffect } from "react";
export default function Footer() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    return (
        <footer
            style={{
                background: "#1a0d00",
                color: "#d4b896",
                padding: "60px 0 32px",
                borderTop: "2px solid #c4a84f",
            }}
        >
            {/* Logic để hiển thị nút Back to Top */}
            {useEffect(() => {
                const handleScroll = () => {
                    setShowScrollTop(window.scrollY > 300);
                };
                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
            }, [])}


            <div
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 40,
                }}
            >
                <div>
                    <img
                        src="https://file.hstatic.net/200000296482/file/logo_1c90af075f3541399f3f74a35237f63c.png"
                        alt="Noritake"
                        style={{ height: 40, marginBottom: 16 }}
                    />
                    <p style={{ fontSize: 13, lineHeight: 1.8, color: "#a08060", margin: "0 0 20px", maxWidth: 280 }}>
                        Website chính thức của Noritake tại Việt Nam — Thương hiệu sứ cao cấp danh tiếng số 1 Nhật Bản.
                    </p>
                    {/* Social Media Icons */}
                    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                        {[
                            { src: "https://file.hstatic.net/200000296482/file/instagram_-_footer_d01f0a0d01324ee0b54dda8d829a9ecc_small.png", alt: "Facebook", href: "#" },
                            { src: "https://file.hstatic.net/200000296482/file/zalo_-_footer_d622bdb0640c465ea6fd753d0a985bf1_small.png", alt: "Instagram", href: "#" },
                            { src: "https://file.hstatic.net/200000296482/file/youtube_-_footer_91ab502f46b34d4e9377dfdcfddd1024_small.png", alt: "YouTube", href: "#" },
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "rgba(196,168,79,0.15)",
                                    border: "1px solid rgba(196,168,79,0.3)",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(196,168,79,0.3)")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(196,168,79,0.15)")}
                            >
                                <img
                                    src={social.src}
                                    alt={social.alt}
                                    style={{ width: "60%", height: "60%", objectFit: "contain" }}
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {[
                    { title: "Sản phẩm", links: ["Bộ ấm trà cao cấp", "Bộ bát đĩa", "Cốc sứ", "Bình hoa", "Quà tặng"] },
                    { title: "Hỗ trợ", links: ["Chính sách đổi trả", "Giao hàng", "Hướng dẫn mua hàng", "Hệ thống cửa hàng"] },
                    { title: "Liên hệ", links: ["📞 0901 234 567", "✉️ info@noritake.vn", "📍 TP. Hồ Chí Minh", "📍 Hà Nội"] },
                ].map((col) => (
                    <div key={col.title}>
                        <h4 style={{ fontSize: 12, letterSpacing: 2, color: "#c4a84f", textTransform: "uppercase", margin: "0 0 16px" }}>
                            {col.title}
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {col.links.map((link) => (
                                <li key={link} style={{ marginBottom: 8 }}>
                                    <a
                                        href="#"
                                        style={{ color: "#a08060", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#c4a84f")}
                                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#a08060")}
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div
                style={{
                    maxWidth: 1280,
                    margin: "40px auto 0",
                    padding: "20px 24px 0",
                    borderTop: "1px solid rgba(196,168,79,0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                }}
            >
                <p style={{ fontSize: 15, color: "#a08060", margin: 0 }}>© 2026 Noritake Vietnam. All rights reserved.</p>
                <p style={{ fontSize: 15, color: "#a08060", margin: 0 }}>Thương hiệu sứ cao cấp số 1 Nhật Bản</p>
            </div>

            {/* Back to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                    position: "fixed",
                    bottom: "40px",
                    right: "40px",
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "#c4a84f",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: showScrollTop ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 99,
                    transition: "all 0.3s ease",
                    opacity: showScrollTop ? 1 : 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#a8893a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c4a84f")}
            >
                ↑
            </button>
        </footer>
    );
}