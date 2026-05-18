export default function GiftSection() {
    interface Gift {
        title: string;
        desc: string;
        href: string;
        image?: string; // Optional for image URL
    }

    const gifts: Gift[] = [
        { title: "Quà tặng Tết", desc: "Sang trọng & ý nghĩa", image: "https://giangnamorina.com/wp-content/uploads/2025/10/z7072263056198_b4ab5c5b7561068bf68625e81a6d6958-1024x894.jpg", href: "/collections/hop-qua-tet-cao-cap" },
        { title: "Quà tặng Doanh nghiệp", desc: "Đẳng cấp & chuyên nghiệp", image: "https://kimnhaxinh.vn/wp-content/uploads/2022/04/tintuc7.jpg", href: "/pages/qua-tang-doanh-nghiep-cao-cap" },
        { title: "Quà tặng Tân gia", desc: "May mắn & thịnh vượng", image: "https://gomsubachviet.vn/wp-content/uploads/2025/06/z6623446918543_1a3eefb6bbb62fb06cafb87d50f2ca83.jpg", href: "/pages/qua-tang-tan-gia-cao-cap" },
        { title: "Quà tặng VIP", desc: "Độc đáo & cao cấp", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb3ZSxYxbAqKPZ1Rygcl5QtSCAzoQlnnUP9Q&s", href: "/pages/qua-tang-khach-hang-vip" },
    ];
    return (
        <section
            style={{
                background: "linear-gradient(135deg, #fdf8ef 0%, #f5e8cc 100%)",
                padding: "72px 0",
                borderTop: "1px solid #ede0c4",
            }}
        >
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
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
                        Dành cho bạn
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(26px,3.5vw,40px)",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 300,
                            color: "#2c1a00",
                            letterSpacing: 2,
                            margin: 0,
                        }}
                    >
                        Giải pháp quà tặng cao cấp
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
                        gridTemplateColumns: "repeat(auto-fit, 220px)",
                        justifyContent: "center",
                        gap: 20,
                    }}
                >
                    {gifts.map((g) => (
                        <a
                            key={g.title}
                            href={g.href}
                            style={{
                                display: "block",
                                textDecoration: "none",
                                background: "#fff",
                                border: "1px solid #ede0c4",
                                padding: "32px 24px",
                                textAlign: "center",
                                transition: "all 0.25s ease",
                                borderRadius: 2,
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "#c4a84f";
                                el.style.boxShadow = "0 8px 32px rgba(196,168,79,0.15)";
                                el.style.transform = "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "#ede0c4";
                                el.style.boxShadow = "none";
                                el.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", alignItems: "center", height: 100 }}>
                                {g.image ? (
                                    <img
                                        src={g.image}
                                        alt={g.title}
                                        style={{ height: 100, width: "auto", objectFit: "contain" }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 36 }}>{g.icon}</span>
                                )}
                            </div>
                            <h3 style={{ fontSize: 18, color: "#2c1a00", fontWeight: 600, margin: "0 0 6px" }}>{g.title}</h3>
                            <p style={{ fontSize: 13, color: "#8b6914", margin: 0 }}>{g.desc}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}