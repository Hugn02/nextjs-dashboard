import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";
import { fetchProductBySlug } from "@/src/features/products/services/product.service";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await fetchProductBySlug(slug);
        if (product) {
            const imageUrls = product.images && product.images.length > 0 ? product.images : [];
            return {
                title: product.name,
                description: product.shortDescription || product.description || `Mua sản phẩm ${product.name} chất lượng cao cấp chế tác thủ công từ làng nghề gốm sứ Bát Tràng cổ truyền.`,
                openGraph: {
                    title: `${product.name} | Bát Tràng`,
                    description: product.shortDescription || product.description,
                    images: imageUrls,
                }
            };
        }
    } catch (e) {
        console.error("Failed to generate metadata for product:", e);
    }
    
    // Fallback
    const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: displayName,
        description: `Chi tiết sản phẩm gốm sứ Bát Tràng ${displayName}.`
    };
}

export default async function Page({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const { slug } = await paramsPromise;

    let product = null;
    let reviews = [];
    let averageRating = 0;
    
    try {
        product = await fetchProductBySlug(slug);
        if (product) {
            const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/reviews?product=${product.id}`, {
                next: { revalidate: 60 }
            });
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || reviewsData || []);
                if (reviews.length > 0) {
                    const sum = reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
                    averageRating = parseFloat((sum / reviews.length).toFixed(1));
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch product / reviews for JSON-LD:", e);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const productJsonLd = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images && product.images.length > 0 ? product.images : [],
        "description": product.shortDescription || product.description || product.name,
        "sku": product.sku || product.id,
        "brand": {
            "@type": "Brand",
            "name": product.brandName || "Bát Tràng"
        },
        "offers": {
            "@type": "Offer",
            "url": `${siteUrl}/products/${product.slug}`,
            "priceCurrency": "VND",
            "price": product.price,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        ...(reviews.length > 0 ? {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": averageRating,
                "reviewCount": reviews.length,
                "bestRating": 5,
                "worstRating": 1
            },
            "review": reviews.map((r: any) => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": r.user?.fullName || "Khách mua hàng"
                },
                "datePublished": r.createdAt,
                "reviewBody": r.comment || "Sản phẩm chất lượng tuyệt vời",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": r.rating,
                    "bestRating": 5,
                    "worstRating": 1
                }
            }))
        } : {})
    } : null;

    return (
        <>
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
                />
            )}
            <Navbar />
            <ProductDetailPage slug={slug} />
            <Footer />
        </>
    );
}

