// Server Component — fetch data ngay trên server, không cần useEffect/useState
import { formatImageUrl } from "@/src/lib/cloudinary";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showOnHome?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

const resolveImageUrl = (image?: string, name?: string) => {
  if (!image) return `https://placehold.co/100x100/faf7f2/c4a84f.png?text=${encodeURIComponent(name || 'Cat')}`;
  // Sử dụng formatImageUrl để resize ảnh ngay trên server (width: 200 cho 100px icon)
  return formatImageUrl(image, { width: 200 });
};

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 300 }, // Cache 5 phút
    });
    if (!res.ok) return [];
    const response = await res.json();
    const rawCategories = Array.isArray(response)
      ? response
      : (response.data?.categories || response.data || []);
    return Array.isArray(rawCategories) ? rawCategories : [];
  } catch {
    return [];
  }
}

export default async function QuickCategories() {
  const categories = await fetchCategories();

  const displayCategories = categories
    .filter((cat) => cat.isActive !== false && cat.showOnHome === true)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  if (displayCategories.length === 0) return null;

  return (
    <section className="bg-white pt-10 md:pt-[60px] pb-10">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#8b6914] font-['Cormorant_Garamond',_serif] uppercase mb-2">
            Khám phá
          </p>
          <h2 className="text-[clamp(22px,4vw,42px)] font-['Cormorant_Garamond',_serif] font-light text-[#2c1a00] tracking-[2px] m-0">
            Bạn đang cần tìm gì?
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {displayCategories.map((cat) => {
            const imgSrc = resolveImageUrl(cat.image, cat.name);
            return (
              <a
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-3 w-[130px] sm:w-[150px] p-4 rounded-xl border border-[#ede0c4] no-underline bg-[#fdfaf4] transition-all duration-300 cursor-pointer hover:bg-[#fff8e8] hover:border-[#c4a84f] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(196,168,79,0.18)]"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#ede0c4]/60 flex-shrink-0 shadow-xs">
                  <ImageWithFallback
                    src={imgSrc}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 80px, 96px"
                    fallbackSrc={`https://placehold.co/200x200/faf7f2/c4a84f.png?text=${encodeURIComponent(cat.name.slice(0, 6))}`}
                  />
                </div>
                <span className="text-[13px] sm:text-[14px] text-[#3d2b00] font-['Cormorant_Garamond',_serif] font-semibold text-center leading-[1.3] line-clamp-2 min-h-[2.4em] flex items-center justify-center">
                  {cat.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
