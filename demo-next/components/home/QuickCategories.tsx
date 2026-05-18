interface Category {
    label: string;
    image: string;
    href: string;
}

const QUICK_CATEGORIES: Category[] = [
    { label: "Bình tài lộc", image: "https://cdn.hstatic.net/files/200000296482/file/binh-tai-loc.png", href: "/collections/flared-vase-limited-collection" },
    { label: "Bình hoa", image: "https://cdn.hstatic.net/files/200000296482/file/binh-hoa.png", href: "/collections/binh-hoa" },
    { label: "Bộ ấm chén trà", image: "https://cdn.hstatic.net/files/200000296482/file/bo-am-tra.png", href: "/collections/bo-am-chen-uong-tra" },
    { label: "Bộ bát đĩa Á", image: "https://cdn.hstatic.net/files/200000296482/file/bo-bat-dia-an-chau-a.png", href: "/collections/bo-bat-dia-an-kieu-a/" },
    { label: "Bộ đĩa kiểu Âu", image: "https://cdn.hstatic.net/files/200000296482/file/bo-dia-an-kieu-au.png", href: "/collections/bo-dia-an-kieu-au" },
    { label: "Sứ trắng", image: "https://cdn.hstatic.net/files/200000296482/file/su-trang-khong-hoa-tiet.png", href: "/collections/su-trang-khong-hoa-tiet" },
    { label: "Dao muỗng nĩa", image: "https://cdn.hstatic.net/files/200000296482/file/dao-muong-nia-dua.png", href: "/collections/dao-muong-nia" },
    { label: "Pha lê - Thủy tinh", image: "https://cdn.hstatic.net/files/200000296482/file/pha-le-thuy-tinh.png", href: "/collections/pha-le-kagami" },
];

export default function QuickCategories() {
    return (
        <section style={{ background: "#fff", padding: "60px 0 40px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <p
                        style={{
                            fontSize: 11,
                            letterSpacing: 4,
                            color: "#c4a84f",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            textTransform: "uppercase",
                            marginBottom: 8,
                        }}
                    >
                        Khám phá
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(28px, 4vw, 42px)",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 300,
                            color: "#2c1a00",
                            letterSpacing: 2,
                            margin: 0,
                        }}
                    >
                        Bạn đang cần tìm gì?
                    </h2>
                    <div
                        style={{
                            width: 60,
                            height: 1,
                            background: "linear-gradient(90deg,transparent,#c4a84f,transparent)",
                            margin: "16px auto 0",
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                        gap: 16,
                    }}
                >
                    {QUICK_CATEGORIES.map((cat) => (
                        <a
                            key={cat.label}
                            href={cat.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                                padding: "20px 12px",
                                borderRadius: 4,
                                border: "1px solid #ede0c4",
                                textDecoration: "none",
                                background: "#fdfaf4",
                                transition: "all 0.25s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "#fff8e8";
                                el.style.borderColor = "#c4a84f";
                                el.style.transform = "translateY(-3px)";
                                el.style.boxShadow = "0 8px 24px rgba(196,168,79,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "#fdfaf4";
                                el.style.borderColor = "#ede0c4";
                                el.style.transform = "translateY(0)";
                                el.style.boxShadow = "none";
                            }}
                        >
                            <img
                                src={cat.image}
                                alt={cat.label}
                                style={{
                                    height: 100,
                                    width: "auto",
                                    objectFit: "contain"
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#3d2b00",
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    lineHeight: 1.4,
                                }}
                            >
                                {cat.label}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}