import { Product } from "../types/product.type";

export interface FetchProductsQuery {
    slug?: string;
    category?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'active' | 'hidden';
}

export interface FetchProductsResponse {
    products: Product[];
    totalCount: number;
}

const API_URL = `${process.env.NEXT_PUBLIC_PRODUCT_API_URL || "http://localhost:3002/products"}`;

const mapProductData = (p: any): Product => ({
    _id: p._id,
    id: p.id || p._id,
    name: p.productName,
    productName: p.productName,
    slug: p.slug || '',
    price: p.newPrice,
    newPrice: p.newPrice,
    originalPrice: p.oldPrice,
    oldPrice: p.oldPrice,
    images: Array.isArray(p.imageUrl) ? p.imageUrl : (p.imageUrl ? [p.imageUrl] : []),
    imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : (p.imageUrl ? [p.imageUrl] : []),
    collection: p.brandName,
    brandName: p.brandName,
    isContact: p.stock === 0,
    badge: p.oldPrice && p.newPrice < p.oldPrice ? `-${Math.round(((p.oldPrice - p.newPrice) / p.oldPrice) * 100)}%` : (p.stock === 0 ? 'Hết hàng' : undefined),
    inStock: p.stock > 0,
});

export const fetchProducts = async (query: FetchProductsQuery): Promise<FetchProductsResponse> => {
    const params = new URLSearchParams();

    // API backend có thể đang mong đợi 'category' để lọc theo slug của danh mục.
    // Nếu có slug, chúng ta sẽ gửi nó dưới dạng tham số 'category'.
    if (query.slug) params.append('slug', query.slug);

    if (query.category) params.append('category', query.category);
    if (query.limit) params.append('limit', String(query.limit));
    if (query.page) params.append('page', String(query.page));
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.status) params.append('status', query.status);

    const url = `${API_URL}?${params.toString()}`;
    console.log("Fetching products from:", url);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.statusText}`);
    }

    const data = await res.json();

    const rawProducts = Array.isArray(data) ? data : data.data?.products || data.data || [];
    const totalCount: number = data.totalCount || data.data?.totalCount || rawProducts.length;

    const formattedProducts: Product[] = rawProducts.map(mapProductData);

    return { products: formattedProducts, totalCount };
};