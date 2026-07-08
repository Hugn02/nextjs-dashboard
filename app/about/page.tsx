import AboutPage from '@/src/features/pages/about/AboutPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';
import { fetchPageByKey } from '@/src/features/pages/services/page.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const page = await fetchPageByKey('about');
        return {
            title: `${page.title || 'Về chúng tôi'} | Bát Tràng`,
            description: page.subtitle || 'Hành trình gìn giữ và phát triển tinh hoa gốm sứ Bát Tràng truyền thống Việt Nam.',
        };
    } catch {
        return { title: 'Về chúng tôi | Bát Tràng' };
    }
}

export default async function Page() {
    const page = await fetchPageByKey('about');
    return (
        <>
            <Navbar />
            <AboutPage page={page} />
            <Footer />
        </>
    );
}
