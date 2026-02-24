import mongoose, { Document } from 'mongoose';
export declare enum OrderStatus {
    CONFIRMED = "confirmed",
    PACKED = "packed",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CARD = "card",
    CASH = "cash",
    ONLINE = "online"
}
export interface IOrderItem {
    medicationId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface IDeliveryAddress {
    street: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface ITrackingUpdate {
    status: string;
    timestamp: Date;
    location?: string;
    notes?: string;
}
export interface IOrder extends Document {
    orderNumber: string;
    requestId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    pharmacyId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    deliveryAddress: IDeliveryAddress;
    status: OrderStatus;
    deliveryPartnerId?: mongoose.Types.ObjectId;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentIntentId?: string;
    trackingUpdates: ITrackingUpdate[];
    invoiceUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=order.model.d.ts.map