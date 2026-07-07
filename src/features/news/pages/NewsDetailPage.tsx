"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchNewsBySlug, fetchNewsList } from "../services/news.service";
import { NewsArticle } from "../types/news.type";

const CLOUDINARY_DOMAIN = "https://res.cloudinary.com/dls9re0ux/image/upload/";

interface Props {
    slug: string;
}

export default function NewsDetailPage({ slug }: Props) {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [related, setRelated] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch current article
                const current = await fetchNewsBySlug(slug);
                setArticle(current);

                // Fetch other articles for suggestions
                const all = await fetchNewsList({ isPublished: true });
                const filterRelated = all
                    .filter((item) => item.slug !== slug)
                    .slice(0, 3); // top 3 related
                setRelated(filterRelated);
            } catch (err: any) {
                console.error("Lỗi tải chi tiết bài viết:", err);
                setError(err.message || "Không thể tải nội dung bài viết");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center pt-24">
                <div className="w-12 h-12 border-4 border-[#e6dcbf] border-t-[#c4a84f] rounded-full animate-spin mb-4" />
                <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#888] text-sm tracking-wider italic">
                    Đang tìm kiếm bài viết trong lịch sử...
                </p>
            </main>
        );
    }

    if (error || !article) {
        return (
            <main className="min-h-[85vh] bg-[#faf7f2] flex flex-col items-center justify-center px-6 pt-24 text-center">
                <div className="text-6xl mb-6 text-slate-400">🏺</div>
                <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-light text-[#2c1a00] uppercase tracking-[2px] mb-3">
                    Bài viết không tồn tại
                </h1>
                <p className="text-[#888] text-sm leading-relaxed mb-8 font-['Cormorant_Garamond',_Georgia,_serif] max-w-sm">
                    {error || "Bài viết bạn đang tìm kiếm có thể đã bị gỡ bỏ hoặc chuyển sang địa chỉ khác."}
                </p>
                <Link
                    href="/news"
                    className="inline-block bg-[#c4a84f] text-white px-8 py-3 text-xs uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] no-underline hover:bg-[#a8893d] transition-colors"
                >
                    Quay lại tin tức
                </Link>
            </main>
        );
    }

    const featuredImage = article.thumbnail
        ? article.thumbnail.startsWith("http")
            ? article.thumbnail
            : `${CLOUDINARY_DOMAIN}${article.thumbnail}`
        : null;

    const dateStr = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : null;

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
                .article-body-content p {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                    color: #3f3f46;
                }
                .article-body-content h2 {
                    font-family: 'Cormorant Garamond', Georgia, serif;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: #2c1a00;
                    letter-spacing: 0.5px;
                }
                .article-body-content h3 {
                    font-family: 'Cormorant Garamond', Georgia, serif;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #2c1a00;
                }
                .article-body-content blockquote {
                    border-left: 3px solid #c4a84f;
                    padding-left: 1.25rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #71717a;
                    background-color: #faf7f2;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                }
                .article-body-content img {
                    border-radius: 2px;
                    margin: 2rem auto;
                    max-width: 100%;
                    height: auto;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
            `}</style>

            <main className="min-h-screen bg-[#faf7f2] pb-24 pt-8 mt-[100px] lg:mt-[120px]">
                <div className="mx-auto max-w-[840px] px-6">
                    {/* Breadcrumbs */}
                    <nav className="font-['Cormorant_Garamond',_Georgia,_serif] mb-8 border-b border-[#e6dcbf] pb-4 text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">
                            Trang chủ
                        </Link>
                        <span className="mx-2">›</span>
                        <Link href="/news" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">
                            Tin tức
                        </Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00] font-semibold line-clamp-1 inline">{article.title}</span>
                    </nav>

                    {/* Header Article */}
                    <header className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs text-[#a08060] font-['Cormorant_Garamond',_Georgia,_serif] mb-4 uppercase tracking-widest">
                            {dateStr && <span>{dateStr}</span>}
                            {article.author && (
                                <>
                                    <span className="w-1 h-1 bg-[#c4a84f] rounded-full" />
                                    <span>Bởi {article.author}</span>
                                </>
                            )}
                        </div>

                        <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#2c1a00] text-3xl md:text-4xl font-semibold leading-tight m-0 mb-4">
                            {article.title}
                        </h1>

                        <div className="h-[1px] w-24 bg-[#c4a84f] mx-auto mt-6 mb-8" />
                    </header>

                    {/* Featured Image */}
                    {featuredImage && (
                        <div className="relative aspect-[16/9] w-full mb-10 overflow-hidden rounded-[2px] border border-[#ede0c4]">
                            <Image
                                src={featuredImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <article className="bg-white rounded border border-[#ede0c4] p-6 md:p-12 shadow-[0_4px_24px_rgba(196,168,79,0.04)]">
                        {article.excerpt && (
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#8b6914] text-base md:text-lg leading-relaxed italic border-b border-[#faf7f2] pb-6 mb-8 mt-0">
                                "{article.excerpt}"
                            </p>
                        )}

                        <div
                            className="article-body-content font-['Cormorant_Garamond',_Georgia,_serif] text-base md:text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="border-t border-[#f5ebd3] mt-12 pt-6 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] uppercase tracking-wider text-[#a08060] font-['Cormorant_Garamond',_Georgia,_serif] font-semibold mr-1">Tags:</span>
                                {article.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-[#faf7f2] border border-[#ede0c4] text-[#8b6914] text-xs px-3 py-1 font-['Cormorant_Garamond',_Georgia,_serif]"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </article>

                    {/* Back Button */}
                    <div className="text-center mt-12 mb-16">
                        <Link
                            href="/news"
                            className="inline-block border border-[#2c1a00] hover:border-[#c4a84f] text-[#2c1a00] hover:text-[#c4a84f] px-8 py-3 text-xs uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] no-underline transition-colors bg-white rounded-[2px]"
                        >
                            Quay lại trang tin tức
                        </Link>
                    </div>

                    {/* Related section */}
                    {related.length > 0 && (
                        <section className="border-t border-[#ede0c4] pt-12">
                            <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] text-xl font-light text-[#2c1a00] uppercase tracking-[2px] text-center mb-8">
                                Bài viết bạn có thể quan tâm
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {related.map((item) => {
                                    const relatedImage = item.thumbnail
                                        ? item.thumbnail.startsWith("http")
                                            ? item.thumbnail
                                            : `${CLOUDINARY_DOMAIN}${item.thumbnail}`
                                        : "https://placehold.co/400x250/faf7f2/c4a84f?text=Gom+Bat+Trang";

                                    return (
                                        <div
                                            key={item.id}
                                            className="group flex flex-col bg-white rounded-[2px] border border-[#ede0c4] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-shadow"
                                        >
                                            <Link href={`/news/${item.slug}`} className="relative aspect-[16/10] overflow-hidden block">
                                                <Image
                                                    src={relatedImage}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-103"
                                                />
                                            </Link>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h4 className="font-['Cormorant_Garamond',_Georgia,_serif] text-sm font-semibold leading-snug m-0 line-clamp-2 flex-1">
                                                    <Link
                                                        href={`/news/${item.slug}`}
                                                        className="text-[#2c1a00] no-underline hover:text-[#c4a84f] transition-colors"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </h4>
                                                <div className="text-[10px] text-[#a08060] font-['Cormorant_Garamond',_Georgia,_serif] mt-2.5">
                                                    {item.publishedAt && new Date(item.publishedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
