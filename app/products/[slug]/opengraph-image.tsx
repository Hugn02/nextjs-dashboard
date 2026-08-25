import { ImageResponse } from "next/og";
import { fetchProductBySlug } from "@/src/features/products/services/product.service";

export const alt = "Sản phẩm gốm sứ Bát Tràng";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await fetchProductBySlug(slug).catch(() => null);
    const productName = product?.name || alt;
    const imageUrl = product?.images?.[0];
    const price = product?.price ? `${new Intl.NumberFormat("vi-VN").format(product.price)} ₫` : "Liên hệ";

    return new ImageResponse(
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#fbf7ef", color: "#2c1a00" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "58%", padding: "64px" }}>
                <div style={{ display: "flex", fontSize: 28, color: "#b58a35", letterSpacing: 2 }}>BÁT TRÀNG VIETNAM</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.12 }}>{productName}</div>
                    <div style={{ display: "flex", fontSize: 36, color: "#b91c1c", fontWeight: 700 }}>{price}</div>
                </div>
                <div style={{ display: "flex", fontSize: 24, color: "#6b5a3a" }}>Gốm sứ thủ công • Tinh hoa Bát Tràng</div>
            </div>
            <div style={{ display: "flex", width: "42%", padding: "42px", alignItems: "center", justifyContent: "center", background: "#efe2c7" }}>
                {imageUrl ? <img src={imageUrl} width="420" height="500" style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }} /> : <div style={{ display: "flex", width: 360, height: 360, borderRadius: 9999, background: "#d4b47a" }} />}
            </div>
        </div>,
        size,
    );
}
