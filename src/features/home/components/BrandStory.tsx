import Image from "next/image";
import ScrollReveal from "@/src/components/ui/ScrollReveal";

export default function BrandStory() {
  return (
    <section className="bg-white py-16 md:py-20 border-t border-[#ede0c4] overflow-hidden">
      <div className="max-w-[960px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* Text column (and image for mobile) */}
        <div className="flex flex-col text-center md:text-left">
          <ScrollReveal animation="fade-right" duration={800}>
            <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
              Di sản hơn 600 năm tồn tại và phát triển
            </p>
            <h2 className="text-[clamp(22px,4vw,40px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[1px] leading-[1.3] mb-5">
              Những giá trị lịch sử và di sản văn hóa làng nghề
            </h2>
          </ScrollReveal>

          {/* Image shown on MOBILE right below the title */}
          <div className="block md:hidden relative w-full mb-6 my-2">
            <ScrollReveal animation="zoom-in" delay={150} duration={800}>
              <div className="relative">
                <div className="absolute -inset-3 border border-[#c4a84f] rounded-[2px] opacity-40 pointer-events-none" />
                <Image
                  src="/assets/brand-history.png"
                  alt="Làng gốm Bát Tràng xưa"
                  width={500}
                  height={600}
                  className="w-full h-auto rounded-[2px] relative z-[1] object-cover"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade-right" delay={200} duration={800}>
            <p className="text-[#6b4c1e] text-[14px] sm:text-[15px] leading-[1.8] mb-6 text-left">
              Sự ra đời của làng gốm Bát Tràng hình thành vào khoảng thế kỷ XIV – XV mang nhiều dấu ấn lịch sử. Theo các tài liệu lịch sử ghi chép, đây là thời kỳ cuối nhà Trần, đầu nhà Lê. Đến nay, làng đã có lịch sử hơn 600 năm tồn tại và phát triển.
              <br /><br />
              Đặc biệt, sự ra đời của làng gốm Bát Tràng còn gắn liền với một câu chuyện dân gian được ghi lại trong sử sách. Chuyện bắt nguồn từ việc 3 vị thái học sinh được cử sang Bắc Tống đã học được kỹ thuật làm gốm của người dân Trung Quốc.
              <br /><br />
              Khi trở về nước, họ mang theo những kiến thức này và truyền lại cho người dân Bát Tràng. Kỹ thuật này đã nhanh chóng được tiếp thu và phát triển, tạo nền móng cho sự hình thành và phát triển của làng nghề.
              <br /><br />
              Qua các thế hệ, người dân Bát Tràng không chỉ giữ gìn kỹ thuật làm gốm mà còn sáng tạo ra nhiều loại hoa văn, họa tiết, màu men độc đáo, góp phần mang đậm bản sắc dân tộc nước ta lên các sản phẩm gốm sứ.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-right" delay={350} duration={800}>
            <div className="w-full text-center md:text-left">
              <a
                href="/news/lich-su-hinh-thanh-va-phat-trien-lang-gom-bat-trang"
                className="inline-block bg-gradient-to-br from-[#8b6914] to-[#c4a84f] text-white no-underline px-9 py-3.5 text-[12px] tracking-[2px] uppercase font-semibold transition-all duration-300 hover:opacity-[0.88] hover:-translate-y-0.5 shadow-md hover:shadow-lg rounded-[2px]"
              >
                Tìm hiểu thêm
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Image column for DESKTOP (hidden on mobile) */}
        <div className="hidden md:block relative">
          <ScrollReveal animation="fade-left" delay={250} duration={900}>
            <div className="relative group">
              <div className="absolute -inset-5 border border-[#c4a84f] rounded-[2px] opacity-40 group-hover:opacity-75 transition-all duration-500 pointer-events-none" />
              <Image
                src="/assets/brand-history.png"
                alt="Làng gốm Bát Tràng xưa"
                width={500}
                height={600}
                className="w-full h-auto rounded-[2px] relative z-[1] object-cover shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
