import AllProductsPage from '@/src/features/products/pages/AllProductsPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tất cả sản phẩm gốm sứ Bát Tràng',
    description: 'Khám phá danh sách đầy đủ các sản phẩm gốm sứ Bát Tràng cao cấp: ấm trà men hỏa biến, bộ ấm chén nghệ nhân, bình hoa decor độc bản.',
    openGraph: {
        title: 'Tất cả sản phẩm gốm sứ Bát Tràng | Bát Tràng',
        description: 'Ấm chén men hỏa biến, bình hoa decor độc bản chế tác thủ công bởi nghệ nhân Bát Tràng Việt Nam.',
    }
};

export default function Page() {
    return (
        <>
            <Navbar />
            <AllProductsPage />
            <Footer />
        </>
    );
}

