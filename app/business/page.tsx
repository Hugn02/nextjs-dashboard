import BusinessPage from '@/src/features/pages/business/BusinessPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';
import { fetchPageByKey } from '@/src/features/pages/services/page.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const page = await fetchPageByKey('business');
        return {
            title: `${page.title || 'Khách hàng doanh nghiệp'} | Bát Tràng`,
            description: page.subtitle || 'Giải pháp gốm sứ cao cấp cho doanh nghiệp — quà tặng, in logo theo yêu cầu, số lượng lớn.',
        };
    } catch {
        return { title: 'Khách hàng doanh nghiệp | Bát Tràng' };
    }
}

export default async function Page() {
    const page = await fetchPageByKey('business');
    return (
        <>
            <Navbar />
            <BusinessPage page={page} />
            <Footer />
        </>
    );
}
