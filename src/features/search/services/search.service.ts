import { Product } from "../../products/types/product.type";
import { SearchQuery, SearchResponse } from "../types/search.type";

const API_URL = `${process.env.NEXT_PUBLIC_PRODUCT_API_URL || "http://localhost:3002/products"}`;

const mapProductData = (p: any): Product => ({
  _id: p._id,
  id: p.id || p._id,
  name: p.productName,
  productName: p.productName,
  slug: p.slug || "",
  price: p.newPrice,
  newPrice: p.newPrice,
  originalPrice: p.oldPrice,
  oldPrice: p.oldPrice,
  images: Array.isArray(p.imageUrl) ? p.imageUrl : p.imageUrl ? [p.imageUrl] : [],
  imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : p.imageUrl ? [p.imageUrl] : [],
  collection: p.brandName,
  brandName: p.brandName,
  isContact: p.stock === 0,
  badge:
    p.oldPrice && p.newPrice < p.oldPrice
      ? `-${Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100)}%`
      : p.stock === 0
      ? "Hết hàng"
      : undefined,
  inStock: p.stock > 0,
  sku: p.sku || "",
  description: p.description || "",
  shortDescription: p.shortDescription || "",
  stock: p.stock ?? 0,
  status: p.status || "active",
  isFeatured: !!p.isFeatured,
  category: p.category || "",
  specifications: Array.isArray(p.specifications) ? p.specifications : [],
});

export const searchProducts = async (query: SearchQuery): Promise<SearchResponse> => {
  const params = new URLSearchParams();

  if (query.name) params.append("name", query.name);
  if (query.page) params.append("page", String(query.page));
  if (query.limit) params.append("limit", String(query.limit));
  params.append("status", "active");

  const url = `${API_URL}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }

  const data = await res.json();
  const rawProducts = Array.isArray(data) ? data : data.data?.products || data.data || [];
  const totalCount: number = data.totalCount || data.data?.totalCount || rawProducts.length;

  return {
    products: rawProducts.map(mapProductData),
    totalCount,
  };
};
