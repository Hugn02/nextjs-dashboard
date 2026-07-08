import Link from "next/link";
import Image from "next/image";

const ARTISAN_IMAGE = "/assets/avatar.jpg";

const highlights = [
  "Chế tác thủ công theo kỹ thuật truyền thống hàng thế kỷ",
  "Men gốm nung lửa độc quyền – không sản phẩm nào giống nhau",
  "Mỗi tác phẩm là dấu ấn riêng của đôi tay nghệ nhân",
];

export default function ArtisanSection() {
  return (
    <section className="bg-[#f8f4ed] py-[80px] border-t border-[#ede0c4]">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <p className="text-[15px] tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
            Nghệ nhân
          </p>
          <h2 className="text-[clamp(28px,4vw,46px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0 leading-[1.25]">
            Nghệ nhân Bát Tràng
          </h2>
          <p className="mt-3 text-[15px] text-[#7a5c30] font-['Cormorant_Garamond',_serif] italic tracking-wide">
            Giữ gìn tinh hoa gốm Việt qua nhiều thế hệ
          </p>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-5" />
        </div>

        {/* ── Two-column content ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT — Artisan photo */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-[420px]">
              {/* Decorative gold accent frame */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#c4a84f] rounded-[20px] opacity-30 pointer-events-none" />

              <div className="relative overflow-hidden rounded-[20px] shadow-[0_24px_64px_rgba(44,26,0,0.18)]"
                style={{ height: "520px" }}>
                <Image
                  src={ARTISAN_IMAGE}
                  alt="Nghệ nhân Bát Tràng đang chế tác gốm thủ công"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 90vw, 420px"
                  priority
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,26,0,0.25)] to-transparent rounded-[20px]" />
              </div>

              {/* Experience badge */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-[#ede0c4] whitespace-nowrap">
                <span className="font-['Cormorant_Garamond',_serif] text-[13px] text-[#8b6914] tracking-wider uppercase font-semibold">
                  Hơn 600 năm truyền nghề
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — Text content */}
          <div className="flex flex-col justify-center">
            <p className="text-[15px] tracking-[3px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-3">
              Người giữ hồn gốm
            </p>

            <h3 className="font-['Cormorant_Garamond',_serif] text-[clamp(28px,3vw,40px)] font-normal text-[#2c1a00] leading-[1.25] tracking-[1px] m-0 mb-5">
              Nghệ nhân gìn giữ<br />
              <em className="not-italic text-[#8b6914]">hồn gốm Việt</em>
            </h3>

            <p className="text-[15px] text-[#5a3e1b] leading-[1.85] mb-7 font-sans">
              Hơn nhiều thế hệ, các nghệ nhân tại làng gốm Bát Tràng đã không
              ngừng gìn giữ và sáng tạo những kỹ thuật chế tác gốm truyền thống
              độc đáo. Từng nét hoa văn, từng lớp men nung đều ẩn chứa tâm huyết
              và tình yêu với nghề — tạo nên những tác phẩm vừa là đồ dùng, vừa
              là nghệ thuật.
            </p>

            {/* Highlight list */}
            <ul className="list-none p-0 m-0 mb-8 flex flex-col gap-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[2px] shrink-0 w-5 h-5 rounded-full bg-[#c4a84f]/20 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] text-[#4a3318] leading-[1.7] font-sans">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div>
              <Link
                href="/about"
                className="inline-block bg-gradient-to-br from-[#8b6914] to-[#c4a84f] text-white no-underline px-9 py-4 text-[12px] tracking-[2.5px] uppercase font-semibold rounded-[2px] transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(139,105,20,0.30)]"
              >
                Khám phá câu chuyện
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
