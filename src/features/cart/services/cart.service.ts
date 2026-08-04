import { Cart } from "../types/cart.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

/** Giữ lại để tương thích ngược nếu nơi khác import */
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

/** GET /api/carts : Lấy danh sách cart items của user (mỗi item = 1 bản ghi riêng) */
export async function getCart(): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/carts`, {
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

/** POST /api/carts : Thêm sản phẩm vào giỏ (mỗi SP lưu thành 1 bản ghi riêng) */
export async function addToCart(
  productId: string,
  quantity = 1
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/carts`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Không thể thêm vào giỏ hàng");
    }
    // BE chỉ trả CartMutationResponseData (không phải full cart list)
    // → refetch toàn bộ cart để đồng bộ state
    return getCart();
  } catch (e) {
    throw e;
  }
}

/** PATCH /api/carts/:cartId : Cập nhật số lượng theo cartId (id bản ghi cart) */
export async function updateCartItem(
  cartId: string,
  quantity: number
): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/carts/${cartId}`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) return null;
    // BE chỉ trả CartMutationResponseData → refetch toàn bộ cart
    return getCart();
  } catch {
    return null;
  }
}

/** DELETE /api/carts/:cartId : Xóa 1 cart item theo cartId */
export async function removeFromCart(cartId: string): Promise<Cart | null> {
  try {
    const res = await fetch(`${API_URL}/carts/${cartId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    // Sau khi xóa thành công, refetch để đồng bộ
    return getCart();
  } catch {
    return null;
  }
}

/** DELETE /api/carts : Xóa toàn bộ giỏ hàng của user */
export async function clearCart(): Promise<void> {
  try {
    await fetch(`${API_URL}/carts`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
  } catch {}
}

/** Chuẩn hóa dữ liệu cart từ backend
 *  BE trả về: { items: CartPageItem[], total: number }
 *  Mỗi item: { id (cartId), product: { id, productName, newPrice, imageUrl, ... }, quantity, price }
 */
function normalizeCart(data: any): Cart {
  if (!data) return { items: [], total: 0 };
  const cartData = data.data || data;
  const items = (cartData.items || []).map((item: any) => {
    const p = item.product || {};
    return {
      id: item.id || item._id || "",   // cartId — dùng để gọi PATCH/DELETE /:cartId
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
        images: Array.isArray(p.images)
          ? p.images
          : Array.isArray(p.imageUrl)
          ? p.imageUrl
          : p.imageUrl
          ? [p.imageUrl]
          : [],
        imageUrl: Array.isArray(p.imageUrl)
          ? p.imageUrl
          : Array.isArray(p.images)
          ? p.images
          : p.imageUrl
          ? [p.imageUrl]
          : [],
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
  return { items, total: cartData.total ?? 0 };
}
