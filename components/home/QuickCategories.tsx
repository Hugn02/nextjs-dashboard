interface Category {
  label: string;
  image: string;
  href: string;
}

const QUICK_CATEGORIES: Category[] = [
  {
    label: "Bình tài lộc",
    image: "https://cdn.hstatic.net/files/200000296482/file/binh-tai-loc.png",
    href: "/collections/flared-vase-limited-collection",
  },
  {
    label: "Bình hoa",
    image: "https://cdn.hstatic.net/files/200000296482/file/binh-hoa.png",
    href: "/collections/binh-hoa",
  },
  {
    label: "Bộ ấm chén trà",
    image: "https://cdn.hstatic.net/files/200000296482/file/bo-am-tra.png",
    href: "/collections/bo-am-chen-uong-tra",
  },
  {
    label: "Bộ bát đĩa Á",
    image:
      "https://cdn.hstatic.net/files/200000296482/file/bo-bat-dia-an-chau-a.png",
    href: "/collections/bo-bat-dia-an-kieu-a/",
  },
  {
    label: "Bộ đĩa kiểu Âu",
    image:
      "https://cdn.hstatic.net/files/200000296482/file/bo-dia-an-kieu-au.png",
    href: "/collections/bo-dia-an-kieu-au",
  },
  {
    label: "Sứ trắng",
    image:
      "https://cdn.hstatic.net/files/200000296482/file/su-trang-khong-hoa-tiet.png",
    href: "/collections/su-trang-khong-hoa-tiet",
  },
  {
    label: "Dao muỗng nĩa",
    image:
      "https://cdn.hstatic.net/files/200000296482/file/dao-muong-nia-dua.png",
    href: "/collections/dao-muong-nia",
  },
  {
    label: "Pha lê - Thủy tinh",
    image:
      "https://cdn.hstatic.net/files/200000296482/file/pha-le-thuy-tinh.png",
    href: "/collections/pha-le-kagami",
  },
];

export default function QuickCategories() {
  return (
    <section className="bg-white pt-[60px] pb-10">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2">
            Khám phá
          </p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0">
            Bạn đang cần tìm gì?
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
          {QUICK_CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-2.5 px-3 py-5 rounded border border-[#ede0c4] no-underline bg-[#fdfaf4] transition-all duration-[250ms] cursor-pointer hover:bg-[#fff8e8] hover:border-[#c4a84f] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(196,168,79,0.15)]"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="h-[100px] w-auto object-contain"
              />
              <span className="text-[12px] text-[#3d2b00] font-['Cormorant_Garamond',_serif] font-semibold text-center leading-[1.4]">
                {cat.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
