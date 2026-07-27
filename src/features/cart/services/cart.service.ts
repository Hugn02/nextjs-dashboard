import { Cart } from "../types/cart.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

/** Lấy hoặc tạo sessionId (UUID) - Giữ lại để tương thích ngược nếu nơi khác import */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("bt_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("bt_session_id", sessionId);
  }
  return sessionId;
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

/** GET /api/cart : Lấy cart cho user hiện tại */
export async function getCart(): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data?.data || data);
  } catch {
    return null;
  }
}

/** POST /api/cart/items : Thêm item (productId, quantity) vào cart */
export async function addToCart(
  productId: string,
  quantity = 1
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể thêm vào giỏ hàng");
    }
    const data = await res.json();
    return normalizeCart(data?.data || data);
  } catch (e) {
    throw e;
  }
}

/** PATCH /api/cart/items/{productId} : Cập nhật 1 sản phẩm trong cart */
export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data?.data || data);
  } catch {
    return null;
  }
}

/** DELETE /api/cart/items/{productId} : Xóa 1 sản phẩm trong cart theo id */
export async function removeFromCart(productId: string): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/items/${productId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data?.data || data);
  } catch {
    return null;
  }
}

/** DELETE /api/cart/items : Xóa toàn bộ sản phẩm trong cart */
export async function clearCart(): Promise<void> {
  try {
    await fetch(`${API_URL}/cart/items`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
  } catch {}
}

/** Chuẩn hóa dữ liệu cart từ backend — map productName → name, imageUrl → images */
function normalizeCart(data: any): Cart {
  if (!data) return { _id: "", sessionId: "", items: [] };
  const cartData = data.data || data;
  const items = (cartData.items || []).map((item: any) => {
    const p = item.product || {};
    return {
      product: {
        _id: p._id || p.id || "",
        id: p._id || p.id || "",
        name: p.name || p.productName || "",
        productName: p.productName || p.name || "",
        slug: p.slug || "",
        price: p.price ?? p.newPrice ?? item.price ?? 0,
        newPrice: p.newPrice ?? p.price ?? item.price ?? 0,
        originalPrice: p.oldPrice || p.originalPrice,
        oldPrice: p.oldPrice || p.originalPrice,
        images: Array.isArray(p.images) ? p.images : Array.isArray(p.imageUrl) ? p.imageUrl : p.imageUrl ? [p.imageUrl] : [],
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : Array.isArray(p.images) ? p.images : p.imageUrl ? [p.imageUrl] : [],
        brandName: p.brandName || "",
        sku: p.sku || "",
        inStock: (p.stock ?? 1) > 0,
        stock: p.stock ?? 0,
        isContact: (p.stock ?? 1) === 0,
      },
      quantity: item.quantity,
      price: item.price ?? p.price ?? p.newPrice ?? 0,
    };
  });
  return { _id: cartData._id || cartData.id || "", sessionId: cartData.sessionId || "", items };
}
