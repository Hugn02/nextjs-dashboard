export default function BrandStory() {
    return (
        <section
            style={{
                background: "#fff",
                padding: "80px 0",
                borderTop: "1px solid #ede0c4",
            }}
        >
            <div
                style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: "0 24px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 64,
                    alignItems: "center",
                }}
            >
                <div>
                    <p
                        style={{
                            fontSize: 11,
                            letterSpacing: 4,
                            color: "#c4a84f",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            textTransform: "uppercase",
                            marginBottom: 12,
                            margin: "0 0 12px",
                        }}
                    >
                        Di sản 120 năm
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(28px,3.5vw,40px)",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontWeight: 300,
                            color: "#2c1a00",
                            letterSpacing: 1,
                            lineHeight: 1.3,
                            margin: "0 0 20px",
                        }}
                    >
                        Tinh hoa sứ Nhật Bản từ năm 1904
                    </h2>
                    <p style={{ color: "#6b4c1e", fontSize: 15, lineHeight: 1.8, margin: "0 0 20px" }}>
                        Noritake là thương hiệu đồ sứ cao cấp hàng đầu Nhật Bản, với hơn 120 năm lịch sử hình thành và phát triển.
                        Mỗi sản phẩm là sự kết hợp giữa kỹ thuật thủ công truyền thống và thiết kế đương đại tinh tế.
                    </p>
                    <a
                        href="/pages/lich-su-100-nam-hinh-thanh-va-phat-trien"
                        style={{
                            display: "inline-block",
                            background: "linear-gradient(135deg, #8b6914, #c4a84f)",
                            color: "#fff",
                            textDecoration: "none",
                            padding: "14px 36px",
                            fontSize: 12,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            fontWeight: 600,
                            transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                    >
                        Tìm hiểu thêm
                    </a>
                </div>
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            top: -20,
                            left: -20,
                            right: -40,
                            bottom: -40,
                            border: "1px solid #c4a84f",
                            borderRadius: 2,
                            opacity: 0.4,
                        }}
                    />
                    <img
                        src="https://file.hstatic.net/200000296482/file/japan-since-1904_8b0265bae0354a56b609ad65f468ff65.jpg"
                        alt="Noritake brand story"
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 2,
                            position: "relative",
                            zIndex: 1,
                        }}
                    />
                </div>
            </div>
        </section>
    );
}