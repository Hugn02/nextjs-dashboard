// Server Component — fetch data ngay trên server, không cần useEffect/useState
import { formatImageUrl } from "@/src/lib/cloudinary";
import ImageWithFallback from "@/src/components/ui/ImageWithFallback";

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

const resolveImageUrl = (image?: string) => {
  if (!image) return `https://placehold.co/400x600/3d2b00/c4a84f.png?text=BST`;
  // Sử dụng formatImageUrl để resize ảnh ngay trên server (width: 440 cho 220px card)
  return formatImageUrl(image, { width: 440 });
};

async function fetchFeaturedCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/collections?showOnHome=true&isActive=true`,
      { next: { tags: ['collections'] } }
    );
    if (!res.ok) return [];
    const response = await res.json();
    return Array.isArray(response) ? response : (response.data || []);
  } catch {
    return [];
  }
}

export default async function FeaturedCollections() {
  const collections = await fetchFeaturedCollections();

  if (collections.length === 0) return null;

  return (
    <section className="bg-[#2c1a00] py-[72px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[13px] sm:text-[15px] tracking-[3px] sm:tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2.5">
            Nổi bật
          </p>
          <h2 className="text-[clamp(22px,4vw,44px)] font-['Cormorant_Garamond',_serif] font-light text-[#fdf8ef] tracking-[2px] sm:tracking-[3px] m-0">
            Bộ sưu tập đặc sắc
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,220px)] justify-center gap-5">
          {collections.map((col) => {
            const imgSrc = resolveImageUrl(col.image);
            return (
              <a
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00]"
              >
                <ImageWithFallback
                  src={imgSrc}
                  alt={col.name}
                  fill
                  sizes="220px"
                  className="object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                  fallbackSrc="https://placehold.co/440x660/3d2b00/c4a84f?text=B%E1%BB%99+S%C6%B0u+T%E1%BA%ADp"
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
