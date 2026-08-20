import { WishlistProduct } from "../types/wishlist.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

function normalizeWishlistItem(item: any): WishlistProduct {
  const pId = item.id || item._id || "";
  const name = item.name || item.productName || "";
  const imgs = Array.isArray(item.images)
    ? item.images
    : Array.isArray(item.imageUrl)
    ? item.imageUrl
    : [];
  return {
    _id: pId,
    id: pId,
    name,
    productName: name,
    slug: item.slug || "",
    price: item.price ?? item.newPrice ?? 0,
    newPrice: item.newPrice ?? item.price ?? 0,
    originalPrice: item.originalPrice ?? item.oldPrice,
    oldPrice: item.oldPrice ?? item.originalPrice,
    images: imgs,
    imageUrl: imgs,
    brandName: item.brandName || "",
    stock: item.stock ?? 0,
    inStock: item.inStock ?? (item.stock ?? 1) > 0,
    isContact: item.isContact ?? (item.stock ?? 1) === 0,
    status: item.status || "active",
    collection: item.collection,
    rating: item.rating,
    reviewCount: item.reviewCount,
    soldCount: item.soldCount,
    badge: item.badge,
    addedAt: item.addedAt,
  };
}

/** GET /api/wishlists - Lấy danh sách sản phẩm yêu thích */
export async function getWishlist(): Promise<{
  items: WishlistProduct[];
  total: number;
  productIds: string[];
} | null> {
  try {
    const res = await fetch(`${API_URL}/wishlists`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.data || data;
    if (!result) return null;

    const rawItems = result.items || [];
    const items = rawItems.map(normalizeWishlistItem);

    return {
      items,
      total: result.total ?? items.length,
      productIds: result.productIds || items.map((i: WishlistProduct) => i.id),
    };
  } catch {
    return null;
  }
}

/** GET /api/wishlists/ids - Lấy danh sách productId yêu thích */
export async function getWishlistedIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/wishlists/ids`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.productIds || [];
  } catch {
    return [];
  }
}

/** POST /api/wishlists/:productId - Toggle yêu thích */
export async function toggleWishlist(
  productId: string
): Promise<{ isWishlisted: boolean; productId: string } | null> {
  try {
    const res = await fetch(`${API_URL}/wishlists/${productId}`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || data;
  } catch {
    return null;
  }
}

/** DELETE /api/wishlists/:productId - Xóa khỏi wishlist */
export async function removeFromWishlist(productId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/wishlists/${productId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}
