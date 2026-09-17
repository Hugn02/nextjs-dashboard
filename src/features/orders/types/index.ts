export interface OrderItemProduct {
    _id?: string;
    id?: string;
    productName: string;
    imageUrl?: string[];
    slug: string;
    sku?: string;
}

export interface OrderItem {
    product: OrderItemProduct;
    quantity: number;
    price: number;
}

export interface OrderDetail {
    _id: string;
    id?: string;
    publicId: string;
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note?: string;
    total: number;
    shippingFee: number;
    shippingProvider?: string;
    shippingProviderName?: string;
    trackingCode?: string | null;
    shippingStatus?: string;
    shippingDetail?: string | null;
    shippingRawStatus?: string | null;
    expectedDeliveryDate?: string | null;
    deliveredAt?: string | null;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    subtotal?: number;
    discountAmount?: number;
    couponCode?: string | null;
    couponId?: string | null;
    items: OrderItem[];
}

export interface OrderHistoryItem {
    _id?: string;
    id?: string;
    publicId: string;
    total: number;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    createdAt: string;
    updatedAt?: string;
    items: Array<{
        product: {
            _id?: string;
            id?: string;
            productName: string;
            imageUrl?: string[];
        };
        quantity: number;
        price: number;
    }>;
}
