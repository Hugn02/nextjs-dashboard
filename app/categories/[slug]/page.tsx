import type { Metadata } from "next";
import CategoryPage from "@/src/features/products/pages/CategoryPage";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface Category {
    name: string;
    slug: string;
    description?: string;
    image?: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
    const fallbackName = slug.replace(/-/g, " ");

    try {
        const response = await fetch(`${apiUrl}/categories/${slug}`, {
            next: { revalidate: 3600, tags: ["categories"] },
        });
        if (response.ok) {
            const json = await response.json();
            const category: Category = json.data || json;
            const title = `${category.name} | Bát Tràng`;
            const description = category.description || `Khám phá các sản phẩm ${category.name} thủ công, chất lượng cao của Bát Tràng.`;
            const categoryUrl = `/categories/${category.slug}`;

            return {
                title,
                description,
                alternates: { canonical: categoryUrl },
                openGraph: {
                    title,
                    description,
                    url: categoryUrl,
                    type: "website",
                    images: category.image ? [{ url: category.image, alt: category.name }] : [],
                },
                twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    images: category.image ? [category.image] : [],
                },
            };
        }
    } catch (error) {
        console.error("Failed to generate metadata for category:", error);
    }

    return {
        title: `${fallbackName} | Bát Tràng`,
        description: `Khám phá các sản phẩm gốm sứ Bát Tràng thuộc danh mục ${fallbackName}.`,
        alternates: { canonical: `/categories/${slug}` },
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    return (
        <>
            <Navbar />
            <CategoryPage slug={slug} />
            <Footer />
        </>
    );
}
