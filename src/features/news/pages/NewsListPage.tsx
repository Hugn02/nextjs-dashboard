"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchNewsList } from "../services/news.service";
import { NewsArticle } from "../types/news.type";

const CLOUDINARY_DOMAIN = "https://res.cloudinary.com/dls9re0ux/image/upload/";

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white">
            <div className="aspect-[16/10] animate-pulse bg-[#f0e8d6]" />
            <div className="p-5 space-y-3">
                <div className="h-3 w-1/4 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-5 w-full rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-[#f0e8d6] animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-[#f0e8d6] animate-pulse pt-2" />
            </div>
        </div>
    );
}

export default function NewsListPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                const list = await fetchNewsList({ isPublished: true });
                setArticles(list);
            } catch (err) {
                console.error("Lỗi tải tin tức:", err);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        loadArticles();
    }, []);

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap');
            `}</style>

            <main className="min-h-[80vh] bg-[#faf7f2] pb-24 mt-[120px]">
                {/* Breadcrumbs */}
                <div className="border-b border-[#e6dcbf] bg-white">
                    <nav className="mx-auto max-w-[1200px] px-6 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">
                            Trang chủ
                        </Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00] font-semibold">Tin tức</span>
                    </nav>
                </div>

                <div className="mx-auto max-w-[1200px] px-6">
                    {/* Page Header */}
                    <div className="hidden lg:block text-center pt-12 pb-10">
                        <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-4xl font-light text-[#2c1a00] uppercase tracking-[4px]">Tin tức & Nghệ thuật gốm</h1>
                        <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#888] text-sm tracking-widest mt-2 max-w-md italic mx-auto">Chia sẻ kiến thức, kỹ thuật làm gốm Bát Tràng và bí quyết gia đình</p>
                    </div>

                    {/* Mobile Title */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-2xl font-light text-[#2c1a00] uppercase tracking-[2px] m-0">
                            Tin tức & Nghệ thuật gốm
                        </h1>
                        <div className="h-0.5 w-16 bg-[#c4a84f] mx-auto mt-3" />
                    </div>

                    {/* List Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <SkeletonCard key={idx} />
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded border border-[#ede0c4] shadow-sm">
                            <div className="text-5xl mb-4 text-[#c4a84f]">📰</div>
                            <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] text-xl font-light text-[#2c1a00] uppercase tracking-wider mb-2">
                                Chưa có bài viết nào
                            </h3>
                            <p className="text-[#888] text-sm font-['Cormorant_Garamond',_Georgia,_serif]">
                                Chúng tôi sẽ sớm đăng tải các bài viết mới. Hãy quay lại sau!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => {
                                const articleImage = article.thumbnail
                                    ? article.thumbnail.startsWith("http")
                                        ? article.thumbnail
                                        : `${CLOUDINARY_DOMAIN}${article.thumbnail}`
                                    : "https://placehold.co/800x500/faf7f2/c4a84f?text=Bat+Trang+Blog";

                                const dateStr = article.publishedAt
                                    ? new Date(article.publishedAt).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : null;

                                return (
                                    <article
                                        key={article.id}
                                        className="group flex flex-col overflow-hidden rounded-[3px] border border-[#ede0c4] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(196,168,79,0.08)]"
                                    >
                                        {/* Image wrapper */}
                                        <Link href={`/news/${article.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-50 block">
                                            <Image
                                                src={articleImage}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                            {article.tags && article.tags.length > 0 && (
                                                <span className="absolute left-4 top-4 bg-[#2c1a00]/80 text-[#d4b896] text-[10px] uppercase tracking-wider font-semibold py-1 px-2.5 rounded-[2px] backdrop-blur-xs font-['Cormorant_Garamond',_Georgia,_serif]">
                                                    {article.tags[0]}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Content info */}
                                        <div className="p-6 flex flex-col flex-1">
                                            {/* Meta */}
                                            <div className="flex items-center gap-3 text-xs text-[#a08060] font-['Cormorant_Garamond',_Georgia,_serif] mb-3">
                                                {dateStr && <span>{dateStr}</span>}
                                                {article.author && (
                                                    <>
                                                        <span className="w-1 h-1 bg-[#c4a84f] rounded-full" />
                                                        <span>Bởi {article.author}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-3 text-lg font-semibold leading-snug">
                                                <Link
                                                    href={`/news/${article.slug}`}
                                                    className="text-[#2c1a00] no-underline hover:text-[#c4a84f] transition-colors"
                                                >
                                                    {article.title}
                                                </Link>
                                            </h2>

                                            {/* Excerpt */}
                                            <p className="text-slate-500 text-xs leading-relaxed font-['Cormorant_Garamond',_Georgia,_serif] mb-5 flex-1 line-clamp-3">
                                                {article.excerpt || "Xem chi tiết bài viết nghệ thuật về làng gốm sứ Bát Tràng cổ truyền."}
                                            </p>

                                            {/* Link */}
                                            <div className="border-t border-[#faf7f2] pt-4 mt-auto">
                                                <Link
                                                    href={`/news/${article.slug}`}
                                                    className="font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] uppercase tracking-widest text-[#2c1a00] font-semibold no-underline hover:text-[#c4a84f] transition-colors flex items-center gap-1.5"
                                                >
                                                    Đọc tiếp
                                                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
