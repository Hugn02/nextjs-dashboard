import CategoryPage from '@/src/features/products/pages/CategoryPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';

interface PageProps {
    params: Promise<{ slug: string }>;
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
