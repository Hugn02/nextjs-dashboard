import NewsListPage from '@/src/features/news/pages/NewsListPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tin tức & Nghệ thuật gốm | Bát Tràng',
    description: 'Chia sẻ kiến thức về sứ cao cấp, lịch sử gốm cổ truyền và nghệ thuật thưởng trà Việt Nam.',
};

export default function Page() {
    return (
        <>
            <Navbar />
            <NewsListPage />
            <Footer />
        </>
    );
}
