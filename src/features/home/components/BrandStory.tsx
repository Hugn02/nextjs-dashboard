import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="bg-white py-20 border-t border-[#ede0c4]">
      <div className="max-w-[960px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-3">
            Di sản hơn 600 năm tồn tại và phát triển
          </p>
          <h2 className="text-[clamp(28px,3.5vw,40px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[1px] leading-[1.3] mb-5">
            Những giá trị lịch sử và di sản văn hóa làng nghề
          </h2>
          <p className="text-[#6b4c1e] text-[15px] leading-[1.8] mb-5">
            Sự ra đời của làng gốm Bát Tràng hình thành vào khoảng thế kỷ XIV – XV mang nhiều dấu ấn lịch sử. Theo các tài liệu lịch sử ghi chép, đây là thời kỳ cuối nhà Trần, đầu nhà Lê. Đến nay, làng đã có lịch sử hơn 600 năm tồn tại và phát triển.

            Đặc biệt, sự ra đời của làng gốm Bát Tràng còn gắn liền với một câu chuyện dân gian được ghi lại trong sử sách. Chuyện bắt nguồn từ việc 3 vị thái học sinh được cử sang Bắc Tống đã học được kỹ thuật làm gốm của người dân Trung Quốc.

            Khi trở về nước, họ mang theo những kiến thức này và truyền lại cho người dân Bát Tràng. Kỹ thuật này đã nhanh chóng được tiếp thu và phát triển, tạo nền móng cho sự hình thành và phát triển của làng nghề.

            Qua các thế hệ, người dân Bát Tràng không chỉ giữ gìn kỹ thuật làm gốm mà còn sáng tạo ra nhiều loại hoa văn, họa tiết, màu men độc đáo, góp phần mang đậm bản sắc dân tộc nước ta lên các sản phẩm gốm sứ.
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
          <Image
            src="/assets/brand-history.png" // Đường dẫn tương đối từ thư mục public
            alt="Làng gốm Bát Tràng xưa"
            width={500} // Cung cấp chiều rộng thực của ảnh
            height={600} // Cung cấp chiều cao thực của ảnh
            className="w-full h-auto rounded-[2px] relative z-[1] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
