const TRUST_BADGES = [
    { icon: "🏆", text: "Thương hiệu sứ cao cấp số 1 Nhật Bản" },
    { icon: "🎁", text: "Hỗ trợ gói quà miễn phí" },
    { icon: "🛡️", text: "Bảo hành bể vỡ khi vận chuyển" },
    { icon: "🚚", text: "Giao hàng toàn quốc" },
];

export default function TrustBar() {
    return (
        <div
            style={{
                background: "#fdf8ef",
                borderTop: "1px solid #e8d9bb",
                borderBottom: "1px solid #e8d9bb",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    animation: "marquee 18s linear infinite",
                    whiteSpace: "nowrap",
                }}
            >
                {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
                    <div
                        key={i}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 40px",
                            fontSize: 13,
                            color: "#5a3e00",
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            letterSpacing: 0.5,
                            borderRight: "1px solid #e8d9bb",
                        }}
                    >
                        <span style={{ fontSize: 16 }}>{b.icon}</span>
                        {b.text}
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}