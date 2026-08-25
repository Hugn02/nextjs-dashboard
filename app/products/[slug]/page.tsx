import type { Metadata } from "next";
import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import { fetchProductBySlug } from "@/src/features/products/services/product.service";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";

interface PageProps {
    params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const productDescription = (name: string, description?: string) =>
    description || `Mua sản phẩm ${name} chất lượng cao cấp chế tác thủ công từ làng nghề gốm sứ Bát Tràng cổ truyền.`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const product = await fetchProductBySlug(slug);
        if (product) {
            const description = productDescription(product.name, product.description);
            const productUrl = `/products/${product.slug}`;
            const ogImageUrl = new URL(`/products/${product.slug}/opengraph-image`, siteUrl).toString();

            return {
                title: product.name,
                description,
                alternates: { canonical: productUrl },
                openGraph: {
                    title: `${product.name} | Bát Tràng`,
                    description,
                    url: productUrl,
                    type: "website",
                    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${product.name} | Bát Tràng` }],
                },
                twitter: {
                    card: "summary_large_image",
                    title: `${product.name} | Bát Tràng`,
                    description,
                    images: [ogImageUrl],
                },
            };
        }
    } catch (error) {
        console.error("Failed to generate metadata for product:", error);
    }

    const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
    return {
        title: displayName,
        description: `Chi tiết sản phẩm gốm sứ Bát Tràng ${displayName}.`,
        alternates: { canonical: `/products/${slug}` },
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    let product = null;
    let reviews: any[] = [];
    let averageRating = 0;

    try {
        product = await fetchProductBySlug(slug);
        if (product) {
            const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/reviews?product=${product.id}`, {
                next: { revalidate: 3600 },
            });
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || []);
                if (reviews.length > 0) {
                    averageRating = Number((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1));
                }
            }
        }
    } catch (error) {
        console.error("Failed to fetch product / reviews for JSON-LD:", error);
    }

    const productUrl = product ? `${siteUrl}/products/${product.slug}` : "";
    const productJsonLd = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": productUrl,
        name: product.name,
        image: product.images || [],
        description: productDescription(product.name, product.description),
        sku: product.sku || product.id,
        brand: { "@type": "Brand", name: product.brandName || "Bát Tràng" },
        offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "VND",
            price: String(product.price),
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
        },
        ...(reviews.length > 0 ? {
            aggregateRating: { "@type": "AggregateRating", ratingValue: averageRating, reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
            review: reviews.map((review: any) => ({
                "@type": "Review",
                author: { "@type": "Person", name: review.user?.fullName || "Khách mua hàng" },
                datePublished: review.createdAt,
                reviewBody: review.comment || "Sản phẩm chất lượng tốt",
                reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
            })),
        } : {}),
    } : null;

    return (
        <>
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
                />
            )}
            <Navbar />
            <ProductDetailPage slug={slug} />
            <Footer />
        </>
    );
}
