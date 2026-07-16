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

    let article = null;
    try {
        article = await fetchNewsBySlug(slug);
    } catch (e) {
        console.error("Failed to fetch article for JSON-LD:", e);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const jsonLd = article ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "image": article.thumbnail ? [article.thumbnail] : [],
        "datePublished": article.publishedAt || article.createdAt,
        "dateModified": article.updatedAt || article.createdAt,
        "description": article.excerpt || article.title,
        "author": {
            "@type": "Person",
            "name": article.author || "Nghệ nhân Bát Tràng"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bát Tràng Vietnam",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/assets/logo2.png`
            }
        }
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <Navbar />
            <NewsDetailPage slug={slug} />
            <Footer />
        </>
    );
}

