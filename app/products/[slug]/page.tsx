import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";

export default async function Page({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const { slug } = await paramsPromise;

    return (
        <>
            <Navbar />
            <ProductDetailPage slug={slug} />
            <Footer />
        </>
    );
}
