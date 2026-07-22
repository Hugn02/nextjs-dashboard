"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchNewsList } from "../../news/services/news.service";
import { NewsArticle } from "../../news/types/news.type";

const CLOUDINARY_DOMAIN = "https://res.cloudinary.com/dls9re0ux/image/upload/";

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-[2px] border border-[#ede0c4] bg-white animate-pulse">
            <div className="aspect-[16/10] bg-[#f0e8d6]" />
            <div className="p-5 space-y-3">
                <div className="h-3 w-1/4 rounded bg-[#f0e8d6]" />
                <div className="h-5 w-full rounded bg-[#f0e8d6]" />
                <div className="h-4 w-5/6 rounded bg-[#f0e8d6]" />
            </div>
        </div>
    );
}

export default function NewsSection() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecentNews = async () => {
            try {
                const list = await fetchNewsList({ isPublished: true });
                setArticles(list.slice(0, 3));
            } catch (err) {
                console.error("Lỗi tải tin tức gần đây:", err);
            } finally {
                setLoading(false);
            }
        };
        loadRecentNews();
    }, []);

    if (loading) {
        return (
            <section className="bg-[#f2eee5] py-12 md:py-16 border-t border-[#ede0c4]">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="text-center mb-10">
                        <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">Tin tức & Sự kiện</p>
                        <h2 className="text-[clamp(20px,4vw,42px)] font-['Cormorant_Garamond',_serif] font-normal text-[#2c1a00] tracking-[1px] m-0 max-w-3xl mx-auto">Chuyên mục cập nhật các tin tức và sự kiện mới nhất tại Nghệ nhân Bát Tràng</h2>
                        <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
        return null; // Không hiển thị gì nếu không có bài viết
    }

    return (
        <section className="bg-[#f2eee5] py-12 md:py-16 border-t border-[#ede0c4]">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="text-center mb-10">
                    <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">Tin tức & Sự kiện</p>
                    <h2 className="text-[clamp(20px,4vw,42px)] font-['Cormorant_Garamond',_serif] font-normal text-[#2c1a00] tracking-[1px] m-0 max-w-3xl mx-auto">Chuyên mục cập nhật các tin tức và sự kiện mới nhất tại Nghệ nhân Bát Tràng</h2>
                    <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article) => {
                        const articleImage = article.thumbnail
                            ? article.thumbnail.startsWith("http")
                                ? article.thumbnail
                                : `${CLOUDINARY_DOMAIN}${article.thumbnail}`
                            : "https://placehold.co/800x500/faf7f2/c4a84f?text=Bat+Trang+Blog";

                        const dateStr = article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("vi-VN", { month: "long", day: "numeric" })
                            : null;

                        return (
                            <article key={article.id} className="group flex flex-col overflow-hidden rounded-[3px] border border-[#ede0c4] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(196,168,79,0.08)]">
                                <Link href={`/news/${article.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-50 block">
                                    <Image src={articleImage} alt={article.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                                </Link>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 text-xs text-[#a08060] font-['Cormorant_Garamond',_Georgia,_serif] mb-3">
                                        {dateStr && <span>{dateStr}</span>}
                                        {article.author && <><span className="w-1 h-1 bg-[#c4a84f] rounded-full" /><span>Bởi {article.author}</span></>}
                                    </div>
                                    <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] m-0 mb-3 text-lg font-semibold leading-snug flex-1">
                                        <Link href={`/news/${article.slug}`} className="text-[#2c1a00] no-underline hover:text-[#c4a84f] transition-colors line-clamp-3">
                                            {article.title}
                                        </Link>
                                    </h2>
                                    <div className="border-t border-[#f2eee5] pt-4 mt-4">
                                        <Link href={`/news/${article.slug}`} className="font-['Cormorant_Garamond',_Georgia,_serif] text-[12px] uppercase tracking-widest text-[#2c1a00] font-semibold no-underline hover:text-[#c4a84f] transition-colors flex items-center gap-1.5">
                                            Đọc tiếp
                                            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/news"
                        className="font-['Cormorant_Garamond',_Georgia,_serif] cursor-pointer rounded-[2px] border border-[#c4a84f] bg-transparent px-8 py-3 text-xs uppercase tracking-[2px] text-[#8b6914] transition-all hover:bg-[#c4a84f] hover:text-white no-underline"
                    >
                        Xem thêm tin tức
                    </Link>
                </div>
            </div>
        </section>
    );
}