"use client";

import { useState, useEffect } from "react";

const CLOUDINARY_DOMAIN = 'https://res.cloudinary.com/dls9re0ux/image/upload/';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

const resolveImageUrl = (image?: string) => {
  if (!image) return `https://placehold.co/400x600/3d2b00/c4a84f?text=BST`;
  return image.startsWith('http') ? image : `${CLOUDINARY_DOMAIN}${image}`;
};

function SkeletonCard() {
  return (
    <div className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00] animate-pulse">
      <div className="w-full h-full bg-[#4a3f35]"></div>
    </div>
  );
}

export default function FeaturedCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCollections = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections?showOnHome=true&isActive=true`);
        if (!res.ok) throw new Error("Failed to fetch featured collections");

        const response = await res.json();
        const data = Array.isArray(response) ? response : (response.data || []);
        setCollections(data);
      } catch (error) {
        console.error("Error fetching featured collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCollections();
  }, []);

  return (
    <section className="bg-[#2c1a00] py-[72px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[15px] tracking-[4px] text-[#c4a84f] font-['Cormorant_Garamond',_serif] uppercase mb-2.5">
            Nổi bật
          </p>
          <h2 className="text-[clamp(28px,4vw,44px)] font-['Cormorant_Garamond',_serif] font-light text-[#fdf8ef] tracking-[3px] m-0">
            Bộ sưu tập đặc sắc
          </h2>
          <div className="w-[60px] h-px bg-gradient-to-r from-transparent via-[#c4a84f] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,220px)] justify-center gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : collections.map((col) => (
              <a
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group block no-underline relative overflow-hidden rounded-[2px] border border-[#c4a84f]/30 aspect-[3/4] bg-[#3d2b00]"
              >
                <img
                  src={resolveImageUrl(col.image)}
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
            ))
          }
        </div>
      </div>
    </section>
  );
}
