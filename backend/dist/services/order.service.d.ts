import mongoose from 'mongoose';
import { IOrder, OrderStatus } from '../models/order.model';
import { CreateOrderInput, UpdateOrderInput, UpdateOrderStatusInput, ProcessPaymentInput, AssignDeliveryInput, CancelOrderInput } from '../validators/order.validator';
interface PaginationOptions {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
interface OrderFilter {
    status?: OrderStatus;
    paymentStatus?: string;
}
export declare class OrderService {
    /**
     * Generate a unique order number in the format ORD-YYYY-XXXXXX
     */
    private static generateOrderNumber;
    /**
     * Create an order from an approved medication request.
     * Uses a MongoDB transaction to atomically:
     *   1. Validate the request is in 'available' status
     *   2. Verify inventory availability and decrement stock
     *   3. Create the order
     *   4. Mark the request as 'fulfilled'
     */
    static createOrder(data: CreateOrderInput, userId: string): Promise<IOrder>;
    static getOrders(filter: OrderFilter, pagination: PaginationOptions): Promise<{
        orders: IOrder[];
        total: number;
        page: number;
        pages: number;
    }>;
    static getOrderById(orderId: string): Promise<IOrder>;
    static updateOrder(orderId: string, data: UpdateOrderInput): Promise<IOrder>;
    static updateOrderStatus(orderId: string, data: UpdateOrderStatusInput): Promise<IOrder>;
    /**
     * Process payment through the Stripe gateway.
     * Creates a payment intent, confirms it, and updates the order's payment status.
     */
    static processPayment(orderId: string, data: ProcessPaymentInput): Promise<IOrder>;
    /**
     * Cancel an order and refund if payment was made.
     * Uses a transaction to restore inventory quantities atomically.
     */
    static cancelOrder(orderId: string, data: CancelOrderInput, userId: string, userRole: string): Promise<IOrder>;
    static getUserOrders(userId: string, pagination: PaginationOptions): Promise<{
        orders: (mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    static getPharmacyOrders(pharmacyId: string, pagination: PaginationOptions): Promise<{
        orders: (mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    static assignDeliveryPartner(orderId: string, data: AssignDeliveryInput): Promise<IOrder>;
    static getDeliveryTracking(orderId: string): Promise<{
        order: IOrder;
        trackingUpdates: IOrder['trackingUpdates'];
    }>;
    static generateInvoice(orderId: string): Promise<IOrder>;
    static getDeliveryPartnerOrders(partnerId: string, pagination: PaginationOptions): Promise<{
        orders: (mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
}
export {};
//# sourceMappingURL=order.service.d.ts.map