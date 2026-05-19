"use client";

import { useState } from "react";

interface Product {
  id: number;
  name: string;
  collection: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: string;
  slug: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Bộ ấm chén trà 13 món | Trefolio Platinum 4957L",
    collection: "Trefolio Platinum 4957L",
    price: "8,866,880₫",
    originalPrice: "10,076,000₫",
    discount: "-12%",
    image:
      "https://cdn.hstatic.net/products/200000296482/untitled-2_bec22998901f48c0b112632caa587887_large.jpg",
    slug: "bo-am-chen-uong-tra-trefolio-platinum",
  },
  {
    id: 2,
    name: "Bộ ấm chén trà 13 món | Harvest Dream 4989L",
    collection: "Harvest Dream 4989L",
    price: "12,485,440₫",
    originalPrice: "14,188,000₫",
    discount: "-12%",
    image:
      "https://cdn.hstatic.net/products/200000296482/untitled-2_1daa7893d55348ebb38bdfa3816c7536_large.jpg",
    slug: "bo-am-chen-uong-tra-harvest-dream",
  },
  {
    id: 3,
    name: "Bộ ấm chén trà 13 món | Cher Blanc 1655L",
    collection: "Cher Blanc 1655L",
    price: "5,283,520₫",
    originalPrice: "6,004,000₫",
    discount: "-12%",
    image:
      "https://product.hstatic.net/200000296482/product/cher_blanc_7bfcddf0f4da4d359d8ce3810ab7fecb_large.jpg",
    slug: "bo-am-chen-uong-tra-cher-blanc",
  },
  {
    id: 4,
    name: "Bộ ấm chén trà 13 món | Hertford 4861L",
    collection: "Hertford 4861L",
    price: "9,567,360₫",
    originalPrice: "10,872,000₫",
    discount: "-12%",
    image:
      "https://product.hstatic.net/200000296482/product/hertford_4cb3184431494a2fa72455b259710659_large.jpg",
    slug: "bo-am-chen-uong-tra-hertford",
  },
  {
    id: 5,
    name: "Bộ ấm chén trà 13 món | Chelsea Estate 1779L",
    collection: "Chelsea Estate 1779L",
    price: "5,673,360₫",
    originalPrice: "6,447,000₫",
    discount: "-12%",
    image:
      "https://product.hstatic.net/200000296482/product/img_8282_3af6e58a640546e08f02f98abe4bfbca_large.jpg",
    slug: "bo-am-chen-uong-tra-chelsea-estate",
  },
  {
    id: 6,
    name: "Bộ ấm chén trà 15 món | Bountiful Garden M-667L",
    collection: "Bountiful Garden M-667L",
    price: "7,487,920₫",
    originalPrice: "8,509,000₫",
    discount: "-12%",
    image:
      "https://cdn.hstatic.net/products/200000296482/nda00883_a6c218722d6747d1a82347e33047c7e4_large.jpg",
    slug: "bo-am-chen-uong-tra-bountiful-garden",
  },
  {
    id: 7,
    name: "Bộ ấm chén trà 13 món | English Herbs 4942L",
    collection: "English Herbs 4942L",
    price: "6,963,440₫",
    originalPrice: "7,913,000₫",
    discount: "-12%",
    image:
      "https://cdn.hstatic.net/products/200000296482/untitled-2_1_5f0cf1a1865444d5a20325c4af2d6eff_large.jpg",
    slug: "bo-am-chen-uong-tra-english-herbs",
  },
  {
    id: 8,
    name: "Bộ ấm chén trà 15 món | Rochelle Platinum 4795L",
    collection: "Rochelle Platinum 4795L",
    price: "17,892,000₫",
    image:
      "https://product.hstatic.net/200000296482/product/img_2066_1041d1114dff4121bd0084de26ba2a2c_large.jpg",
    slug: "bo-am-chen-uong-tra-rochelle-platinum",
  },
];

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white border border-[#ede0c4] rounded-[2px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="relative aspect-square overflow-hidden bg-[#faf7f2]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {product.discount && (
          <div className="absolute top-2.5 left-2.5 bg-[#c4a84f] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
            {product.discount}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-[#2c1a00]/88 text-white text-center p-3 text-xs uppercase opacity-0 translate-y-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Xem chi tiết →
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] text-[#c4a84f] tracking-[1.5px] uppercase mb-1.5">
          {product.collection}
        </p>
        <h3 className="text-[13px] text-[#2c1a00] font-semibold leading-[1.5] mb-3 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-[#8b2500]">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[12px] text-[#aaa] line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  return (
    <section className="bg-[#faf7f2] py-[60px]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[4px] text-[#c4a84f] uppercase mb-2">
              Bestseller
            </p>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-light text-[#2c1a00] tracking-[2px] m-0">
              TOP BỘ ẤM CHÉN UỐNG TRÀ
            </h2>
            <div className="w-20 h-px bg-gradient-to-r from-[#c4a84f] to-transparent mt-3.5" />
          </div>
          <a
            href="/collections/bo-am-chen-uong-tra"
            className="text-[12px] text-[#8b6914] no-underline tracking-[2px] uppercase border border-[#c4a84f] px-6 py-2.5 transition-all hover:bg-[#c4a84f] hover:text-white"
          >
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
