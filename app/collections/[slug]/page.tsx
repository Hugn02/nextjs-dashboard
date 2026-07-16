import CollectionsPage from "@/src/features/products/pages/CollectionPage";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/collections`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const collections = Array.isArray(data) ? data : (data.data || []);
        const collection = collections.find((col: any) => col.slug === slug);

        if (collection) {
            return {
                title: `Bộ sưu tập ${collection.name}`,
                description: collection.description || `Khám phá các sản phẩm độc đáo thuộc bộ sưu tập ${collection.name} từ gốm sứ Bát Tràng cổ truyền.`,
                openGraph: {
                    title: `Bộ sưu tập ${collection.name} | Bát Tràng`,
                    description: collection.description,
                    images: collection.imageUrl ? [collection.imageUrl] : [],
                }
            };
        }
    } catch (e) {
        console.error("Failed to generate metadata for collection:", e);
    }
    
    // Fallback
    const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: `Bộ sưu tập ${displayName}`,
        description: `Danh sách sản phẩm gốm sứ Bát Tràng thuộc bộ sưu tập ${displayName}.`
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;

    return (
        <>
            <Navbar />
            <CollectionsPage slug={slug} />
            <Footer />
        </>
    );
}

