export interface CartItem {
    _id: string;
    quantity: number;
    name: string;
    price: number;
    image: string;
    hasDiscount?: boolean;
    originalPrice?: number;
    discountedPrice?: number;
    discountPercent?: number;
}