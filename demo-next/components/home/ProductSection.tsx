"use client";

import { useState } from "react";

interface Product {
    id: number;
    name: string;
    collection: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    image: string;
    slug: string;
}

const PRODUCTS: Product[] = [
    { id: 1, name: "Bộ ấm chén trà 13 món | Trefolio Platinum 4957L", collection: "Trefolio Platinum 4957L", price: "8,866,880₫", originalPrice: "10,076,000₫", discount: "-12%", image: "https://cdn.hstatic.net/products/200000296482/untitled-2_bec22998901f48c0b112632caa587887_large.jpg", slug: "bo-am-chen-uong-tra-trefolio-platinum" },
    { id: 2, name: "Bộ ấm chén trà 13 món | Harvest Dream 4989L", collection: "Harvest Dream 4989L", price: "12,485,440₫", originalPrice: "14,188,000₫", discount: "-12%", image: "https://cdn.hstatic.net/products/200000296482/untitled-2_1daa7893d55348ebb38bdfa3816c7536_large.jpg", slug: "bo-am-chen-uong-tra-harvest-dream" },
    { id: 3, name: "Bộ ấm chén trà 13 món | Cher Blanc 1655L", collection: "Cher Blanc 1655L", price: "5,283,520₫", originalPrice: "6,004,000₫", discount: "-12%", image: "https://product.hstatic.net/200000296482/product/cher_blanc_7bfcddf0f4da4d359d8ce3810ab7fecb_large.jpg", slug: "bo-am-chen-uong-tra-cher-blanc" },
    { id: 4, name: "Bộ ấm chén trà 13 món | Hertford 4861L", collection: "Hertford 4861L", price: "9,567,360₫", originalPrice: "10,872,000₫", discount: "-12%", image: "https://product.hstatic.net/200000296482/product/hertford_4cb3184431494a2fa72455b259710659_large.jpg", slug: "bo-am-chen-uong-tra-hertford" },
    { id: 5, name: "Bộ ấm chén trà 13 món | Chelsea Estate 1779L", collection: "Chelsea Estate 1779L", price: "5,673,360₫", originalPrice: "6,447,000₫", discount: "-12%", image: "https://product.hstatic.net/200000296482/product/img_8282_3af6e58a640546e08f02f98abe4bfbca_large.jpg", slug: "bo-am-chen-uong-tra-chelsea-estate" },
    { id: 6, name: "Bộ ấm chén trà 15 món | Bountiful Garden M-667L", collection: "Bountiful Garden M-667L", price: "7,487,920₫", originalPrice: "8,509,000₫", discount: "-12%", image: "https://cdn.hstatic.net/products/200000296482/nda00883_a6c218722d6747d1a82347e33047c7e4_large.jpg", slug: "bo-am-chen-uong-tra-bountiful-garden" },
    { id: 7, name: "Bộ ấm chén trà 13 món | English Herbs 4942L", collection: "English Herbs 4942L", price: "6,963,440₫", originalPrice: "7,913,000₫", discount: "-12%", image: "https://cdn.hstatic.net/products/200000296482/untitled-2_1_5f0cf1a1865444d5a20325c4af2d6eff_large.jpg", slug: "bo-am-chen-uong-tra-english-herbs" },
    { id: 8, name: "Bộ ấm chén trà 15 món | Rochelle Platinum 4795L", collection: "Rochelle Platinum 4795L", price: "17,892,000₫", image: "https://product.hstatic.net/200000296482/product/img_2066_1041d1114dff4121bd0084de26ba2a2c_large.jpg", slug: "bo-am-chen-uong-tra-rochelle-platinum" },
];

function ProductCard({ product }: { product: Product }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #ede0c4",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: hovered ? "translateY(-4px)" : "none",
                boxShadow: hovered ? "0 12px 36px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#faf7f2" }}>
                <img
                    src={product.image}
                    alt={product.name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        transform: hovered ? "scale(1.06)" : "scale(1)",
                    }}
                />
                {product.discount && (
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#c4a84f", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 2 }}>
                        {product.discount}
                    </div>
                )}
                {hovered && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(44,26,0,0.88)", color: "#fff", textAlign: "center", padding: "12px", fontSize: 12, textTransform: "uppercase" }}>
                        Xem chi tiết →
                    </div>
                )}
            </div>
            <div style={{ padding: "16px" }}>
                <p style={{ fontSize: 10, color: "#c4a84f", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 6px" }}>
                    {product.collection}
                </p>
                <h3 style={{ fontSize: 13, color: "#2c1a00", fontWeight: 600, lineHeight: 1.5, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {product.name}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#8b2500" }}>{product.price}</span>
                    {product.originalPrice && (
                        <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>{product.originalPrice}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductSection() {
    return (
        <section style={{ background: "#faf7f2", padding: "60px 0" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 11, letterSpacing: 4, color: "#c4a84f", textTransform: "uppercase", marginBottom: 8 }}>Bestseller</p>
                        <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 300, color: "#2c1a00", letterSpacing: 2, margin: 0 }}>
                            TOP BỘ ẤM CHÉN UỐNG TRÀ
                        </h2>
                        <div style={{ width: 80, height: 1, background: "linear-gradient(90deg,#c4a84f,transparent)", marginTop: 14 }} />
                    </div>
                    <a
                        href="/collections/bo-am-chen-uong-tra"
                        style={{ fontSize: 12, color: "#8b6914", textDecoration: "none", letterSpacing: 2, textTransform: "uppercase", border: "1px solid #c4a84f", padding: "10px 24px", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c4a84f"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#8b6914"; }}
                    >
                        Xem tất cả →
                    </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                    {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        </section>
    );
}