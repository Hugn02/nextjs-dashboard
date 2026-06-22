export default function GiftSection() {
  interface Gift {
    title: string;
    desc: string;
    href: string;
    image?: string; // Optional for image URL
    icon?: string; // Thêm icon vào interface để tránh lỗi TypeScript
  }

  const gifts: Gift[] = [
    {
      title: "Quà tặng Tết",
      desc: "Sang trọng & ý nghĩa",
      image:
        "https://giangnamorina.com/wp-content/uploads/2025/10/z7072263056198_b4ab5c5b7561068bf68625e81a6d6958-1024x894.jpg",
      href: "/collections/hop-qua-tet-cao-cap",
    },
    {
      title: "Quà tặng Doanh nghiệp",
      desc: "Đẳng cấp & chuyên nghiệp",
      image: "https://kimnhaxinh.vn/wp-content/uploads/2022/04/tintuc7.jpg",
      href: "/pages/qua-tang-doanh-nghiep-cao-cap",
    },
    {
      title: "Quà tặng Tân gia",
      desc: "May mắn & thịnh vượng",
      image:
        "https://gomsubachviet.vn/wp-content/uploads/2025/06/z6623446918543_1a3eefb6bbb62fb06cafb87d50f2ca83.jpg",
      href: "/pages/qua-tang-tan-gia-cao-cap",
    },
    {
      title: "Quà tặng VIP",
      desc: "Độc đáo & cao cấp",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb3ZSxYxbAqKPZ1Rygcl5QtSCAzoQlnnUP9Q&s",
      href: "/pages/qua-tang-khach-hang-vip",
    },
  ];
  return (
    <section className="bg-gradient-to-br from-[#fdf8ef] to-[#f5e8cc] py-[72px] border-t border-[#ede0c4]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2">
            Dành cho bạn
          </p>
          <h2 className="text-[clamp(26px,3.5vw,40px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0">
            Giải pháp quà tặng cao cấp
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,220px)] justify-center gap-5">
          {gifts.map((g) => (
            <a
              key={g.title}
              href={g.href}
              className="block no-underline bg-white border border-[#ede0c4] p-[32px_24px] text-center transition-all duration-[250ms] rounded-[2px] hover:border-[#c4a84f] hover:shadow-[0_8px_32px_rgba(196,168,79,0.15)] hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center items-center h-[100px]">
                {g.image ? (
                  <img
                    src={g.image}
                    alt={g.title}
                    className="h-full w-auto object-contain"
                  />
                ) : (
                  <span className="text-[36px]">{g.icon}</span>
                )}
              </div>
              <h3 className="text-[18px] text-[#2c1a00] font-semibold mb-1.5">
                {g.title}
              </h3>
              <p className="text-[13px] text-[#8b6914] m-0">{g.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
