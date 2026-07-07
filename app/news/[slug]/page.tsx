import NewsDetailPage from '@/src/features/news/pages/NewsDetailPage';
import Footer from '@/src/layout/Footer';
import Navbar from '@/src/layout/Navbar';
import { fetchNewsBySlug } from '@/src/features/news/services/news.service';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const article = await fetchNewsBySlug(slug);
        return {
            title: `${article.title} | Bát Tràng`,
            description: article.excerpt || `Đọc bài viết "${article.title}" chia sẻ từ các nghệ nhân gốm cổ truyền Bát Tràng.`,
            openGraph: {
                title: article.title,
                description: article.excerpt,
                images: article.thumbnail ? [article.thumbnail] : [],
            }
        };
    } catch {
        return {
            title: 'Bài viết | Bát Tràng',
            description: 'Bài viết nghệ thuật gốm sứ Bát Tràng.',
        };
    }
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    return (
        <>
            <Navbar />
            <NewsDetailPage slug={slug} />
            <Footer />
        </>
    );
}
