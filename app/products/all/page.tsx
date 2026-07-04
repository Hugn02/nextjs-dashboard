import AllProductsPage from '@/src/features/products/pages/AllProductsPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';

export default function Page() {
    return (
        <>
            <Navbar />
            <AllProductsPage />
            <Footer />
        </>
    );
}
