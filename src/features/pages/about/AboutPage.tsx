"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SitePage } from "../types/page.type";

interface Props {
    page: SitePage;
}

interface Collection {
    id: string;
    name: string;
    slug: string;
    image?: string;
}

const CLOUDINARY = "https://res.cloudinary.com/dls9re0ux/image/upload/";

function resolveImage(url?: string, fallback = "") {
    if (!url) return fallback;
    return url.startsWith("http") ? url : `${CLOUDINARY}${url}`;
}

function SkeletonCard() {
    return (
        <div className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00] animate-pulse">
            <div className="w-full h-full bg-[#4a3f35]"></div>
        </div>
    );
}

// ─── Fallback defaults khi chưa có dữ liệu CMS ────────────────────────────────
const DEFAULT_TITLE = "Về chúng tôi";
const DEFAULT_SUBTITLE = "Hành trình gìn giữ và phát triển tinh hoa gốm sứ Bát Tràng truyền thống Việt Nam";
const DEFAULT_CONTENT = `<p>Bát Tràng Heirloom được thành lập với sứ mệnh gìn giữ và quảng bá tinh hoa gốm sứ truyền thống của làng gốm Bát Tràng — ngôi làng nghề đã có lịch sử hơn 700 năm bên bờ sông Hồng, Hà Nội.</p><p>Mỗi sản phẩm chúng tôi tạo ra đều được chế tác thủ công bởi các nghệ nhân lành nghề, mang trong mình câu chuyện về đất, lửa và tâm huyết của người thợ gốm Việt.</p>`;

// ─── Section Components ─────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="border-b border-[#f0e8d6] py-16 last:border-b-0">
            <div className="mx-auto max-w-[900px] px-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-[#e6dcbf]" />
                    <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-[4px] text-[#c4a84f] font-semibold">
                        {label}
                    </span>
                    <div className="h-px flex-1 bg-[#e6dcbf]" />
                </div>
                {children}
            </div>
        </section>
    );
}

export default function AboutPage({ page }: Props) {
    const title = page.title || DEFAULT_TITLE;
    const subtitle = page.subtitle || DEFAULT_SUBTITLE;
    const content = page.content || DEFAULT_CONTENT;
    const getYoutubeEmbedId = (url?: string) => {
        if (!url) return null;
        const match = url.match(/(?:embed\/|v=|youtu\.be\/)([^&?]+)/);
        return match ? match[1] : null;
    };
    const youtubeId = getYoutubeEmbedId(page.videoUrl);

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loadingCollections, setLoadingCollections] = useState(true);

    useEffect(() => {
        const fetchFeaturedCollections = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections?showOnHome=true&isActive=true&limit=4`);
                if (!res.ok) throw new Error("Failed to fetch featured collections");

                const response = await res.json();
                const data = Array.isArray(response) ? response : (response.data || []);
                setCollections(data);
            } catch (error) {
                console.error("Error fetching featured collections:", error);
            } finally {
                setLoadingCollections(false);
            }
        };
        fetchFeaturedCollections();
    }, []);

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
                .about-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #3f3f46; }
                .about-content h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.4rem; font-weight: 600; color: #2c1a00; margin: 2rem 0 1rem; }
                .about-content h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 600; color: #2c1a00; margin: 1.5rem 0 0.75rem; }
                .about-content blockquote { border-left: 3px solid #c4a84f; padding: 0.75rem 1.25rem; margin: 1.5rem 0; font-style: italic; color: #71717a; background: #faf7f2; }
                .about-content img { border-radius: 2px; margin: 2rem auto; max-width: 100%; height: auto; box-shadow: 0 4px 12px rgba(0,0,0,.05); display: block; }
                .about-content ul { list-style: none; padding: 0; margin: 1.5rem 0; }
                .about-content ul li { padding: 0.4rem 0 0.4rem 1.5rem; position: relative; color: #3f3f46; line-height: 1.7; }
                .about-content ul li::before { content: '✦'; position: absolute; left: 0; color: #c4a84f; font-size: 0.65rem; top: 0.6rem; }
            `}</style>

            <main className="min-h-screen bg-[#faf7f2] mt-[100px] lg:mt-[120px]">

                {/* Breadcrumb */}
                <div className="border-b border-[#e6dcbf] bg-white">
                    <nav className="mx-auto max-w-[1200px] px-6 py-3 font-['Cormorant_Garamond',_Georgia,_serif] text-xs tracking-wider text-[#888]">
                        <Link href="/" className="text-[#888] no-underline hover:text-[#c4a84f] transition-colors">Trang chủ</Link>
                        <span className="mx-2">›</span>
                        <span className="text-[#2c1a00] font-semibold">{title}</span>
                    </nav>
                </div>

                {/* Page Header */}
                <div className="text-center px-6 py-12 bg-white">
                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#c4a84f] text-xs uppercase tracking-[5px] mb-4">
                        Bát Tràng Heirloom
                    </p>
                    <h1 className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#2c1a00] text-3xl lg:text-5xl font-light uppercase tracking-[3px] mb-4">
                        {title}
                    </h1>
                    <div className="h-[1px] w-20 bg-[#c4a84f] mx-auto mb-4" />
                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-slate-500 text-sm lg:text-base max-w-xl italic mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* Nội dung chính */}
                <Section label="Câu chuyện thương hiệu">
                    <div
                        className="about-content font-['Cormorant_Garamond',_Georgia,_serif] text-base lg:text-lg"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </Section>

                {/* Video YouTube (nếu có) */}
                {youtubeId && (
                    <Section label="Giới thiệu video">
                        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-[3px] overflow-hidden border border-[#ede0c4] shadow-lg">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="Giới thiệu Bát Tràng"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </Section>
                )}

                {/* Thông tin liên hệ */}
                {(page.address || page.phone || page.email) && (
                    <Section label="Thông tin liên hệ">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {page.address && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border border-[#e6dcbf] bg-white flex items-center justify-center text-[#c4a84f]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-widest text-[#c4a84f] font-semibold mb-1">Địa chỉ</div>
                                        <p className="text-[#2c1a00] text-sm font-['Cormorant_Garamond',_Georgia,_serif]">{page.address}</p>
                                    </div>
                                </div>
                            )}
                            {page.phone && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border border-[#e6dcbf] bg-white flex items-center justify-center text-[#c4a84f]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.63 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.5a16 16 0 0 0 6.59 6.59l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-widest text-[#c4a84f] font-semibold mb-1">Điện thoại</div>
                                        <a href={`tel:${page.phone}`} className="text-[#2c1a00] text-sm font-['Cormorant_Garamond',_Georgia,_serif] no-underline hover:text-[#c4a84f] transition-colors">{page.phone}</a>
                                    </div>
                                </div>
                            )}
                            {page.email && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border border-[#e6dcbf] bg-white flex items-center justify-center text-[#c4a84f]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-widest text-[#c4a84f] font-semibold mb-1">Email</div>
                                        <a href={`mailto:${page.email}`} className="text-[#2c1a00] text-sm font-['Cormorant_Garamond',_Georgia,_serif] no-underline hover:text-[#c4a84f] transition-colors">{page.email}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* CTA */}
                <div className="py-16 bg-[#2c1a00]">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="text-center mb-12">
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#d4b896] text-xs uppercase tracking-[4px] mb-4">Khám phá bộ sưu tập</p>
                            <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] text-white text-3xl font-light uppercase tracking-[2px] mb-8">
                                Gốm Sứ Thủ Công Bát Tràng
                            </h2>
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fit,220px)] justify-center gap-5">
                            {loadingCollections
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                                : collections.map((col) => (
                                    <a
                                        key={col.id}
                                        href={`/collections/${col.slug}`}
                                        className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00]"
                                    >
                                        <Image
                                            src={resolveImage(col.image, `https://placehold.co/400x600/3d2b00/c4a84f?text=BST`)}
                                            alt={col.name}
                                            fill
                                            sizes="220px"
                                            className="object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1e0a00]/90 to-transparent p-[32px_20px_20px]">
                                            <h3 className="text-[#fdf8ef] text-[22px] font-normal mb-1">{col.name}</h3>
                                            <span className="text-[#c4a84f] text-[11px] uppercase">Xem bộ sưu tập →</span>
                                        </div>
                                    </a>
                                ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
