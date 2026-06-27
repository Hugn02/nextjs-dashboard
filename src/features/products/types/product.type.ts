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
    collection?: string;
    brandName: string;
    isContact?: boolean;
    badge?: string;
    inStock: boolean;
}