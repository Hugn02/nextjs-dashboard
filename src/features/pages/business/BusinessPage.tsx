"use client";

import Link from "next/link";
import { SitePage } from "../types/page.type";

interface Props {
    page: SitePage;
}

const DEFAULT_TITLE = "Khách hàng doanh nghiệp";
const DEFAULT_SUBTITLE = "Giải pháp gốm sứ cao cấp cho doanh nghiệp — quà tặng, in logo theo yêu cầu, số lượng lớn";
const DEFAULT_CONTENT = `<p>Chúng tôi cung cấp giải pháp toàn diện cho doanh nghiệp đang tìm kiếm quà tặng gốm sứ cao cấp, mang đậm bản sắc văn hoá Việt Nam. Từ thiết kế mẫu riêng đến sản xuất số lượng lớn, chúng tôi đồng hành cùng doanh nghiệp của bạn.</p>`;
const DEFAULT_BENEFITS = [
    "Thiết kế và sản xuất theo yêu cầu riêng",
    "In logo, thương hiệu lên sản phẩm",
    "Hỗ trợ đặt hàng số lượng lớn",
    "Giao hàng toàn quốc và quốc tế",
    "Tư vấn chọn mẫu sản phẩm phù hợp",
    "Bao bì đóng gói chuyên nghiệp",
];

const PROCESS_STEPS = [
    { step: "01", title: "Tư vấn & Báo giá", desc: "Liên hệ ngay để được tư vấn miễn phí. Chúng tôi sẽ gợi ý mẫu phù hợp với ngân sách và mục đích của doanh nghiệp bạn." },
    { step: "02", title: "Thiết kế & Phê duyệt", desc: "Đội ngũ nghệ nhân sẽ phác thảo mẫu theo yêu cầu. Sau khi phê duyệt, chúng tôi bắt đầu sản xuất mẫu thử." },
    { step: "03", title: "Sản xuất & Kiểm định", desc: "Toàn bộ sản phẩm được sản xuất thủ công và kiểm tra chất lượng nghiêm ngặt trước khi đóng gói." },
    { step: "04", title: "Giao hàng & Bàn giao", desc: "Đóng gói chuyên nghiệp, giao hàng đúng hạn toàn quốc. Hỗ trợ xuất khẩu quốc tế theo yêu cầu." },
];

export default function BusinessPage({ page }: Props) {
    const title = page.title || DEFAULT_TITLE;
    const subtitle = page.subtitle || DEFAULT_SUBTITLE;
    const content = page.content || DEFAULT_CONTENT;
    const benefits: string[] = Array.isArray(page.metadata?.benefits) && page.metadata!.benefits.length > 0
        ? page.metadata!.benefits
        : DEFAULT_BENEFITS;

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
                .business-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #3f3f46; }
                .business-content h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.4rem; font-weight: 600; color: #2c1a00; margin: 2rem 0 1rem; }
                .business-content h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-weight: 600; color: #2c1a00; margin: 1.5rem 0 0.75rem; }
                .business-content blockquote { border-left: 3px solid #c4a84f; padding: 0.75rem 1.25rem; margin: 1.5rem 0; font-style: italic; color: #71717a; background: #faf7f2; }
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
                    <div className="flex gap-4 mt-8 justify-center">
                        <Link href="/about" className="bg-[#c4a84f] text-[#2c1a00] px-8 py-3 text-xs uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] font-bold no-underline hover:bg-[#d4b864] transition-colors">
                            Liên hệ ngay
                        </Link>
                        <Link href="/functions/qua-tang" className="border border-[#2c1a00] text-[#2c1a00] px-8 py-3 text-xs uppercase tracking-[2px] font-['Cormorant_Garamond',_Georgia,_serif] no-underline hover:bg-[#2c1a00] hover:text-white transition-colors">
                            Xem sản phẩm
                        </Link>
                    </div>
                </div>

                {/* Giới thiệu dịch vụ */}
                <section className="py-16 border-b border-[#f0e8d6]">
                    <div className="mx-auto max-w-[900px] px-6">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-[4px] text-[#c4a84f] font-semibold">Dịch vụ của chúng tôi</span>
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                        </div>
                        <div
                            className="business-content font-['Cormorant_Garamond',_Georgia,_serif] text-base lg:text-lg"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </section>

                {/* Lợi ích */}
                <section className="py-16 bg-white border-b border-[#f0e8d6]">
                    <div className="mx-auto max-w-[1100px] px-6">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-[4px] text-[#c4a84f] font-semibold">Lợi ích hợp tác</span>
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {benefits.map((benefit, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 p-5 border border-[#ede0c4] rounded-[2px] bg-[#faf7f2] hover:border-[#c4a84f] transition-colors group"
                                >
                                    <div className="w-9 h-9 flex-shrink-0 rounded-full border border-[#c4a84f] flex items-center justify-center bg-white text-[#c4a84f] font-['Cormorant_Garamond',_Georgia,_serif] font-bold text-sm group-hover:bg-[#c4a84f] group-hover:text-white transition-colors">
                                        {idx + 1}
                                    </div>
                                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#2c1a00] text-sm leading-relaxed mt-1.5">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quy trình hợp tác */}
                <section className="py-16 border-b border-[#f0e8d6]">
                    <div className="mx-auto max-w-[1100px] px-6">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                            <span className="font-['Cormorant_Garamond',_Georgia,_serif] text-xs uppercase tracking-[4px] text-[#c4a84f] font-semibold">Quy trình hợp tác</span>
                            <div className="h-px flex-1 bg-[#e6dcbf]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {PROCESS_STEPS.map((step, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="font-['Cormorant_Garamond',_Georgia,_serif] text-5xl font-light text-[#e6dcbf] mb-3">{step.step}</div>
                                    <h3 className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#2c1a00] font-semibold text-base mb-3">{step.title}</h3>
                                    <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#888] text-xs leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Thông tin liên hệ */}
                {(page.address || page.phone || page.email) && (
                    <section className="py-16 bg-[#2c1a00]">
                        <div className="mx-auto max-w-[900px] px-6 text-center">
                            <p className="font-['Cormorant_Garamond',_Georgia,_serif] text-[#d4b896] text-xs uppercase tracking-[4px] mb-4">Liên hệ hợp tác</p>
                            <h2 className="font-['Cormorant_Garamond',_Georgia,_serif] text-white text-3xl font-light uppercase tracking-[2px] mb-10">
                                Để lại thông tin — Chúng tôi sẽ liên hệ ngay
                            </h2>
                            <div className="flex flex-wrap justify-center gap-8">
                                {page.phone && (
                                    <a href={`tel:${page.phone}`} className="flex items-center gap-3 text-[#d4b896] no-underline hover:text-[#c4a84f] transition-colors font-['Cormorant_Garamond',_Georgia,_serif]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.63 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.5a16 16 0 0 0 6.59 6.59l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        {page.phone}
                                    </a>
                                )}
                                {page.email && (
                                    <a href={`mailto:${page.email}`} className="flex items-center gap-3 text-[#d4b896] no-underline hover:text-[#c4a84f] transition-colors font-['Cormorant_Garamond',_Georgia,_serif]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                        {page.email}
                                    </a>
                                )}
                                {page.address && (
                                    <span className="flex items-center gap-3 text-[#d4b896] font-['Cormorant_Garamond',_Georgia,_serif]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {page.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}
