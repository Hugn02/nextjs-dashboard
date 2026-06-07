const FEATURED_COLLECTIONS = [
  {
    name: "Cher Blanc",
    image:
      "https://file.hstatic.net/200000296482/file/cher_blanc_65e7279a6a55464193cd0f89fb474088.png",
    href: "#",
  },
  {
    name: "Yoshino",
    image:
      "https://file.hstatic.net/200000296482/file/yoshino_a7727a8ade0a4fee8f5f90e238f17d93.png",
    href: "/collections/Yoshino-9983J",
  },
  {
    name: "Crochet",
    image:
      "https://file.hstatic.net/200000296482/file/crochet_b8e62f06fda34491a748dab14b98f7bd.png",
    href: "/collections/crochet-4966",
  },
  {
    name: "Rochelle Gold",
    image:
      "https://file.hstatic.net/200000296482/file/rochelle_gold_d4d0753851b64103aeaeee94d00c5c61.png",
    href: "/collections/rochelle-gold-4796l",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="bg-[#2c1a00] py-[72px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2.5">
            Nổi bật
          </p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-['Cormorant_Garamond',_serif] font-light text-[#fdf8ef] tracking-[3px] m-0">
            Bộ sưu tập đặc sắc
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,220px)] justify-center gap-5">
          {FEATURED_COLLECTIONS.map((col) => (
            <a
              key={col.name}
              href={col.href}
              className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00]"
            >
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1e0a00]/90 to-transparent p-[32px_20px_20px]">
                <h3 className="text-[#fdf8ef] text-[22px] font-normal mb-1">
                  {col.name}
                </h3>
                <span className="text-[#c4a84f] text-[11px] uppercase">
                  Xem bộ sưu tập →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
