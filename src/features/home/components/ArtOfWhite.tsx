"use client";

import Image from "next/image";

export default function ArtOfWhite() {
  return (
    <section className="bg-[#f2eee5] py-16 md:py-24 px-6 md:px-12 border-t border-[#ede0c4]">
      {/* Import the elegant cursive font for this section */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
      `}</style>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Left Column: Text Content */}
        <div className="flex flex-col justify-center">
          {/* Cursive Title */}
          <div className="mb-3">
            <span className="font-['Alex_Brush',_cursive] text-[36px] sm:text-[48px] md:text-[68px] text-[#4a3f35] leading-none block text-center md:text-left">
              The Art of Fire
            </span>
          </div>

          {/* Subtitle with Gold Vertical Bar */}
          <div className="flex gap-3 mb-6 items-stretch justify-center md:justify-start">
            <div className="w-[3px] bg-[#c4a84f] shrink-0" />
            <h3 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-sans font-bold tracking-[1.5px] sm:tracking-[2px] text-[#2c1a00] uppercase leading-tight">
              Nghệ thuật men hỏa biến
            </h3>
          </div>

          {/* Paragraph and Action Button */}
          <div className="flex flex-col items-center">
            <p className="text-center text-[#554433] text-[14px] md:text-[16px] leading-[1.8] mb-8 font-sans max-w-[480px]">
              Men hỏa biến là dòng men được tạo ra bởi sự tương tác hóa học giữa oxit kim loại và men nền trong môi trường nhiệt độ cao. Mỗi sản phẩm là một tác phẩm nghệ thuật độc nhất, không thể sao chép, mang vẻ đẹp của sự ngẫu hứng và biến ảo kỳ diệu từ lửa.
            </p>

            <a
              href="/collections/men-hoa-bien"
              className="inline-block bg-[#c4a84f] hover:bg-[#b0923a] text-white font-sans text-[11px] tracking-[2px] font-bold px-9 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              XEM THÊM NGAY
            </a>
          </div>
        </div>

        {/* Right Column: Embedded YouTube Video */}
        <div className="relative group w-full flex justify-center p-4 md:p-6">
          <div className="relative w-full max-w-[560px] aspect-video rounded-[2px] shadow-[12px_18px_35px_rgba(0,0,0,0.5)]">
            <iframe
              className="w-full h-full rounded-[2px]"
              src="https://www.youtube.com/embed/zznr9ZZWQ48?si=A3HzC7FyA0MzOo2n"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
