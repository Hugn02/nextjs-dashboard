const FEATURED_COLLECTIONS = [
    { name: "Cher Blanc", image: "https://file.hstatic.net/200000296482/file/cher_blanc_65e7279a6a55464193cd0f89fb474088.png", href: "#" },
    { name: "Yoshino", image: "https://file.hstatic.net/200000296482/file/yoshino_a7727a8ade0a4fee8f5f90e238f17d93.png", href: "/collections/Yoshino-9983J" },
    { name: "Crochet", image: "https://file.hstatic.net/200000296482/file/crochet_b8e62f06fda34491a748dab14b98f7bd.png", href: "/collections/crochet-4966" },
    { name: "Rochelle Gold", image: "https://file.hstatic.net/200000296482/file/rochelle_gold_d4d0753851b64103aeaeee94d00c5c61.png", href: "/collections/rochelle-gold-4796l" },
];

export default function FeaturedCollections() {
    return (
        <section style={{ background: "#2c1a00", padding: "72px 0" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <p
                        style={{
                            fontSize: 11,
                            letterSpacing: 4,
                            color: "#c4a84f",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            textTransform: "uppercase",
                            marginBottom: 10,
                        }}
                    >
                        Nổi bật
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(28px,4vw,44px)",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 300,
                            color: "#fdf8ef",
                            letterSpacing: 3,
                            margin: 0,
                        }}
                    >
                        Bộ sưu tập đặc sắc
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
                    {FEATURED_COLLECTIONS.map((col) => (
                        <a
                            key={col.name}
                            href={col.href}
                            style={{
                                display: "block",
                                textDecoration: "none",
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: 2,
                                border: "1px solid rgba(196,168,79,0.3)",
                                aspectRatio: "3/4",
                                background: "#3d2b00",
                            }}
                        >
                            <img
                                src={col.image}
                                alt={col.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    opacity: 0.85,
                                    transition: "all 0.5s ease",
                                }}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = "1";
                                    (e.target as HTMLImageElement).style.transform = "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = "0.85";
                                    (e.target as HTMLImageElement).style.transform = "scale(1)";
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "linear-gradient(to top, rgba(30,10,0,0.9) 0%, transparent 100%)",
                                    padding: "32px 20px 20px",
                                }}
                            >
                                <h3 style={{ color: "#fdf8ef", fontSize: 22, fontWeight: 400, margin: "0 0 4px" }}>{col.name}</h3>
                                <span style={{ color: "#c4a84f", fontSize: 11, textTransform: "uppercase" }}>Xem bộ sưu tập →</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}