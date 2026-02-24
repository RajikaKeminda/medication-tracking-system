"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = require("../models/order.model");
const request_model_1 = require("../models/request.model");
const inventory_model_1 = require("../models/inventory.model");
const stripe_service_1 = require("./stripe.service");
const api_error_1 = require("../utils/api-error");
const logger_1 = require("../utils/logger");
const TAX_RATE = 0.05;
class OrderService {
    /**
     * Generate a unique order number in the format ORD-YYYY-XXXXXX
     */
    static async generateOrderNumber() {
        const year = new Date().getFullYear();
        const latestOrder = await order_model_1.Order.findOne({ orderNumber: new RegExp(`^ORD-${year}-`) }, { orderNumber: 1 }, { sort: { orderNumber: -1 } });
        let sequence = 1;
        if (latestOrder?.orderNumber) {
            const parts = latestOrder.orderNumber.split('-');
            sequence = parseInt(parts[2], 10) + 1;
        }
        return `ORD-${year}-${String(sequence).padStart(6, '0')}`;
    }
    /**
     * Create an order from an approved medication request.
     * Uses a MongoDB transaction to atomically:
     *   1. Validate the request is in 'available' status
     *   2. Verify inventory availability and decrement stock
     *   3. Create the order
     *   4. Mark the request as 'fulfilled'
     */
    static async createOrder(data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const request = await request_model_1.MedicationRequest.findById(data.requestId).session(session);
            if (!request) {
                throw api_error_1.ApiError.notFound('Medication request not found');
            }
            if (request.status !== request_model_1.RequestStatus.AVAILABLE) {
                throw api_error_1.ApiError.badRequest(`Request must be in '${request_model_1.RequestStatus.AVAILABLE}' status to create an order. Current: '${request.status}'`);
            }
            if (request.userId.toString() !== userId) {
                throw api_error_1.ApiError.forbidden('You can only create orders for your own requests');
            }
            for (const item of data.items) {
                const inventoryItem = await inventory_model_1.Inventory.findById(item.medicationId).session(session);
                if (!inventoryItem) {
                    throw api_error_1.ApiError.notFound(`Medication '${item.name}' not found in inventory`);
                }
                if (inventoryItem.quantity < item.quantity) {
                    throw api_error_1.ApiError.badRequest(`Insufficient stock for '${item.name}'. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`);
                }
                inventoryItem.quantity -= item.quantity;
                await inventoryItem.save({ session });
            }
            const items = data.items.map((item) => ({
                medicationId: new mongoose_1.default.Types.ObjectId(item.medicationId),
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
            }));
            const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
            const deliveryFee = data.deliveryFee ?? 0;
            const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
            const totalAmount = parseFloat((subtotal + deliveryFee + tax).toFixed(2));
            const orderNumber = await this.generateOrderNumber();
            const [order] = await order_model_1.Order.create([
                {
                    orderNumber,
                    requestId: new mongoose_1.default.Types.ObjectId(data.requestId),
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    pharmacyId: request.pharmacyId,
                    items,
                    subtotal,
                    deliveryFee,
                    tax,
                    totalAmount,
                    deliveryAddress: data.deliveryAddress,
                    status: order_model_1.OrderStatus.CONFIRMED,
                    paymentStatus: order_model_1.PaymentStatus.PENDING,
                    paymentMethod: data.paymentMethod,
                    trackingUpdates: [
                        {
                            status: order_model_1.OrderStatus.CONFIRMED,
                            timestamp: new Date(),
                            notes: 'Order created from approved medication request',
                        },
                    ],
                },
            ], { session });
            request.status = request_model_1.RequestStatus.FULFILLED;
            request.responseDate = new Date();
            await request.save({ session });
            await session.commitTransaction();
            logger_1.logger.info(`Order ${orderNumber} created successfully for user ${userId}`);
            return order.populate([
                { path: 'userId', select: 'name email phone' },
                { path: 'pharmacyId', select: 'name location contactInfo' },
            ]);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async getOrders(filter, pagination) {
        const query = {};
        if (filter.status)
            query.status = filter.status;
        if (filter.paymentStatus)
            query.paymentStatus = filter.paymentStatus;
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            order_model_1.Order.find(query)
                .populate('userId', 'name email phone')
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            order_model_1.Order.countDocuments(query),
        ]);
        return {
            orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
    static async getOrderById(orderId) {
        const order = await order_model_1.Order.findById(orderId)
            .populate('userId', 'name email phone')
            .populate('pharmacyId', 'name location contactInfo')
            .populate('deliveryPartnerId', 'name email phone');
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        return order;
    }
    static async updateOrder(orderId, data) {
        const order = await order_model_1.Order.findById(orderId);
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        if ([order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.CANCELLED].includes(order.status)) {
            throw api_error_1.ApiError.badRequest(`Cannot update an order with status '${order.status}'`);
        }
        if (data.deliveryAddress)
            order.deliveryAddress = data.deliveryAddress;
        if (data.deliveryFee !== undefined) {
            order.deliveryFee = data.deliveryFee;
            order.totalAmount = parseFloat((order.subtotal + data.deliveryFee + order.tax).toFixed(2));
        }
        if (data.estimatedDelivery) {
            order.estimatedDelivery = new Date(data.estimatedDelivery);
        }
        await order.save();
        return order;
    }
    static async updateOrderStatus(orderId, data) {
        const order = await order_model_1.Order.findById(orderId);
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        if (order.status === order_model_1.OrderStatus.CANCELLED) {
            throw api_error_1.ApiError.badRequest('Cannot update status of a cancelled order');
        }
        if (order.status === order_model_1.OrderStatus.DELIVERED) {
            throw api_error_1.ApiError.badRequest('Order has already been delivered');
        }
        const validTransitions = {
            [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PACKED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.PACKED]: [order_model_1.OrderStatus.OUT_FOR_DELIVERY, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.OUT_FOR_DELIVERY]: [order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.DELIVERED]: [],
            [order_model_1.OrderStatus.CANCELLED]: [],
        };
        if (!validTransitions[order.status]?.includes(data.status)) {
            throw api_error_1.ApiError.badRequest(`Invalid status transition from '${order.status}' to '${data.status}'`);
        }
        order.status = data.status;
        order.trackingUpdates.push({
            status: data.status,
            timestamp: new Date(),
            location: data.location,
            notes: data.notes,
        });
        if (data.status === order_model_1.OrderStatus.DELIVERED) {
            order.actualDelivery = new Date();
        }
        await order.save();
        return order;
    }
    /**
     * Process payment through the Stripe gateway.
     * Creates a payment intent, confirms it, and updates the order's payment status.
     */
    static async processPayment(orderId, data) {
        const order = await order_model_1.Order.findById(orderId);
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        if (order.paymentStatus === order_model_1.PaymentStatus.PAID) {
            throw api_error_1.ApiError.badRequest('Order has already been paid');
        }
        if (order.status === order_model_1.OrderStatus.CANCELLED) {
            throw api_error_1.ApiError.badRequest('Cannot process payment for a cancelled order');
        }
        try {
            const paymentIntent = await stripe_service_1.StripeService.createPaymentIntent(order.totalAmount, 'usd', { orderId: orderId, orderNumber: order.orderNumber });
            const confirmedIntent = await stripe_service_1.StripeService.confirmPaymentIntent(paymentIntent.id);
            order.paymentStatus = order_model_1.PaymentStatus.PAID;
            order.paymentMethod = data.paymentMethod;
            order.paymentIntentId = confirmedIntent.id;
            await order.save();
            logger_1.logger.info(`Payment processed for order ${order.orderNumber}: ${confirmedIntent.id}`);
            return order;
        }
        catch (error) {
            order.paymentStatus = order_model_1.PaymentStatus.FAILED;
            await order.save();
            logger_1.logger.error(`Payment failed for order ${order.orderNumber}:`, error);
            throw api_error_1.ApiError.badRequest('Payment processing failed. Please try again.');
        }
    }
    /**
     * Cancel an order and refund if payment was made.
     * Uses a transaction to restore inventory quantities atomically.
     */
    static async cancelOrder(orderId, data, userId, userRole) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const order = await order_model_1.Order.findById(orderId).session(session);
            if (!order) {
                throw api_error_1.ApiError.notFound('Order not found');
            }
            if (order.status === order_model_1.OrderStatus.CANCELLED) {
                throw api_error_1.ApiError.badRequest('Order is already cancelled');
            }
            if (order.status === order_model_1.OrderStatus.DELIVERED) {
                throw api_error_1.ApiError.badRequest('Cannot cancel a delivered order');
            }
            const isOwner = order.userId.toString() === userId;
            const isStaffOrAdmin = ['Pharmacy Staff', 'System Admin'].includes(userRole);
            if (!isOwner && !isStaffOrAdmin) {
                throw api_error_1.ApiError.forbidden('You do not have permission to cancel this order');
            }
            for (const item of order.items) {
                await inventory_model_1.Inventory.findByIdAndUpdate(item.medicationId, { $inc: { quantity: item.quantity } }, { session });
            }
            if (order.paymentStatus === order_model_1.PaymentStatus.PAID && order.paymentIntentId) {
                await stripe_service_1.StripeService.createRefund(order.paymentIntentId);
                order.paymentStatus = order_model_1.PaymentStatus.REFUNDED;
            }
            order.status = order_model_1.OrderStatus.CANCELLED;
            order.trackingUpdates.push({
                status: order_model_1.OrderStatus.CANCELLED,
                timestamp: new Date(),
                notes: data.reason || 'Order cancelled',
            });
            await order.save({ session });
            await request_model_1.MedicationRequest.findByIdAndUpdate(order.requestId, { status: request_model_1.RequestStatus.AVAILABLE }, { session });
            await session.commitTransaction();
            logger_1.logger.info(`Order ${order.orderNumber} cancelled by user ${userId}`);
            return order;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async getUserOrders(userId, pagination) {
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            order_model_1.Order.find({ userId })
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            order_model_1.Order.countDocuments({ userId }),
        ]);
        return { orders, total, page, pages: Math.ceil(total / limit) };
    }
    static async getPharmacyOrders(pharmacyId, pagination) {
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            order_model_1.Order.find({ pharmacyId })
                .populate('userId', 'name email phone')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            order_model_1.Order.countDocuments({ pharmacyId }),
        ]);
        return { orders, total, page, pages: Math.ceil(total / limit) };
    }
    static async assignDeliveryPartner(orderId, data) {
        const order = await order_model_1.Order.findById(orderId);
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        if (order.status === order_model_1.OrderStatus.CANCELLED || order.status === order_model_1.OrderStatus.DELIVERED) {
            throw api_error_1.ApiError.badRequest(`Cannot assign delivery partner to a '${order.status}' order`);
        }
        order.deliveryPartnerId = new mongoose_1.default.Types.ObjectId(data.deliveryPartnerId);
        order.trackingUpdates.push({
            status: 'delivery_partner_assigned',
            timestamp: new Date(),
            notes: `Delivery partner ${data.deliveryPartnerId} assigned`,
        });
        await order.save();
        return order.populate('deliveryPartnerId', 'name email phone');
    }
    static async getDeliveryTracking(orderId) {
        const order = await order_model_1.Order.findById(orderId)
            .populate('userId', 'name phone')
            .populate('pharmacyId', 'name location')
            .populate('deliveryPartnerId', 'name phone');
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        return { order, trackingUpdates: order.trackingUpdates };
    }
    static async generateInvoice(orderId) {
        const order = await order_model_1.Order.findById(orderId)
            .populate('userId', 'name email phone address')
            .populate('pharmacyId', 'name location contactInfo');
        if (!order) {
            throw api_error_1.ApiError.notFound('Order not found');
        }
        order.invoiceUrl = `/invoices/${order.orderNumber}.pdf`;
        await order.save();
        return order;
    }
    static async getDeliveryPartnerOrders(partnerId, pagination) {
        const { page, limit, sortBy, sortOrder } = pagination;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            order_model_1.Order.find({ deliveryPartnerId: partnerId })
                .populate('userId', 'name phone address')
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            order_model_1.Order.countDocuments({ deliveryPartnerId: partnerId }),
        ]);
        return { orders, total, page, pages: Math.ceil(total / limit) };
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map