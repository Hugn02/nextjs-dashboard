export interface Product {
    _id: string;
    id: string;
    name: string;
    productName: string;
    slug: string;
    price: number;
    newPrice: number;
    originalPrice?: number;
    oldPrice?: number;
    images: string[];
    imageUrl: string[];
    /** Collection ID from backend */
    collection?: string;
    /** Collection display name (resolved client-side) */
    collectionName?: string;
    /** Collection slug (resolved client-side for linking) */
    collectionSlug?: string;
    /** Category display name (resolved client-side) */
    categoryName?: string;
    /** Category slug (resolved client-side for linking) */
    categorySlug?: string;
    brandName: string;
    isContact?: boolean;
    badge?: string;
    inStock: boolean;
    sku?: string;
    description?: string;
    shortDescription?: string;
    stock?: number;
    status?: string;
    isFeatured?: boolean;
    category?: string;
    /** Array of function IDs assigned to this product */
    functions?: string[];
    specifications?: { label: string; value: string }[];
}