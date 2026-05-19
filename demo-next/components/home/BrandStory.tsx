export default function BrandStory() {
  return (
    <section className="bg-white py-20 border-t border-[#ede0c4]">
      <div className="max-w-[960px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-3">
            Di sản 120 năm
          </p>
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[1px] leading-[1.3] mb-5">
            Tinh hoa sứ Nhật Bản từ năm 1904
          </h2>
          <p className="text-[#6b4c1e] text-[15px] leading-[1.8] mb-5">
            Noritake là thương hiệu đồ sứ cao cấp hàng đầu Nhật Bản, với hơn 120
            năm lịch sử hình thành và phát triển. Mỗi sản phẩm là sự kết hợp
            giữa kỹ thuật thủ công truyền thống và thiết kế đương đại tinh tế.
          </p>
          <a
            href="/pages/lich-su-100-nam-hinh-thanh-va-phat-trien"
            className="inline-block bg-gradient-to-br from-[#8b6914] to-[#c4a84f] text-white no-underline px-9 py-3.5 text-[12px] tracking-[2px] uppercase font-semibold transition-opacity hover:opacity-[0.88]"
          >
            Tìm hiểu thêm
          </a>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 border border-[#c4a84f] rounded-[2px] opacity-40" />{" "}
          <img
            src="https://file.hstatic.net/200000296482/file/japan-since-1904_8b0265bae0354a56b609ad65f468ff65.jpg"
            alt="Noritake brand story"
            className="w-full h-auto rounded-[2px] relative z-[1]"
          />
        </div>
      </div>
    </section>
  );
}
