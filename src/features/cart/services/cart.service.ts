import { Cart } from "../types/cart.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

/** Lấy hoặc tạo sessionId (UUID) và lưu localStorage */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("bt_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("bt_session_id", sessionId);
  }
  return sessionId;
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-session-id": getSessionId(),
});

export async function getCart(): Promise<Cart | null> {
  const sessionId = getSessionId();
  if (!sessionId) return null;
  try {
    const res = await fetch(`${API_URL}/cart`, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data);
  } catch {
    return null;
  }
}

export async function addToCart(
  productId: string,
  quantity = 1
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể thêm vào giỏ hàng");
    }
    const data = await res.json();
    return normalizeCart(data);
  } catch (e) {
    throw e;
  }
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/update`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data);
  } catch {
    return null;
  }
}

export async function removeFromCart(productId: string): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/cart/remove/${productId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeCart(data);
  } catch {
    return null;
  }
}

export async function clearCart(): Promise<void> {
  try {
    await fetch(`${API_URL}/cart/clear`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  } catch {}
}

/** Chuẩn hóa dữ liệu cart từ backend — map productName → name, imageUrl → images */
function normalizeCart(data: any): Cart {
  const items = (data.items || []).map((item: any) => {
    const p = item.product || {};
    return {
      product: {
        _id: p._id || p.id || "",
        id: p._id || p.id || "",
        name: p.productName || p.name || "",
        productName: p.productName || p.name || "",
        slug: p.slug || "",
        price: p.newPrice || item.price || 0,
        newPrice: p.newPrice || item.price || 0,
        originalPrice: p.oldPrice,
        oldPrice: p.oldPrice,
        images: Array.isArray(p.imageUrl) ? p.imageUrl : p.imageUrl ? [p.imageUrl] : [],
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : p.imageUrl ? [p.imageUrl] : [],
        brandName: p.brandName || "",
        sku: p.sku || "",
        inStock: (p.stock ?? 1) > 0,
        stock: p.stock ?? 0,
        isContact: (p.stock ?? 1) === 0,
      },
      quantity: item.quantity,
      price: item.price,
    };
  });
  return { _id: data._id || "", sessionId: data.sessionId || "", items };
}
