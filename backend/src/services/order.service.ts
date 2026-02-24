import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus, PaymentStatus, PaymentMethod } from '../models/order.model';
import { MedicationRequest, RequestStatus } from '../models/request.model';
import { Inventory } from '../models/inventory.model';
import { StripeService } from './stripe.service';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';
import {
  CreateOrderInput,
  UpdateOrderInput,
  UpdateOrderStatusInput,
  ProcessPaymentInput,
  AssignDeliveryInput,
  CancelOrderInput,
} from '../validators/order.validator';

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

const TAX_RATE = 0.05;

export class OrderService {
  /**
   * Generate a unique order number in the format ORD-YYYY-XXXXXX
   */
  private static async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const latestOrder = await Order.findOne(
      { orderNumber: new RegExp(`^ORD-${year}-`) },
      { orderNumber: 1 },
      { sort: { orderNumber: -1 } }
    );

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
  static async createOrder(data: CreateOrderInput, userId: string): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const request = await MedicationRequest.findById(data.requestId).session(session);
      if (!request) {
        throw ApiError.notFound('Medication request not found');
      }

      if (request.status !== RequestStatus.AVAILABLE) {
        throw ApiError.badRequest(
          `Request must be in '${RequestStatus.AVAILABLE}' status to create an order. Current: '${request.status}'`
        );
      }

      if (request.userId.toString() !== userId) {
        throw ApiError.forbidden('You can only create orders for your own requests');
      }

      for (const item of data.items) {
        const inventoryItem = await Inventory.findById(item.medicationId).session(session);
        if (!inventoryItem) {
          throw ApiError.notFound(`Medication '${item.name}' not found in inventory`);
        }
        if (inventoryItem.quantity < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for '${item.name}'. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`
          );
        }

        inventoryItem.quantity -= item.quantity;
        await inventoryItem.save({ session });
      }

      const items = data.items.map((item) => ({
        medicationId: new mongoose.Types.ObjectId(item.medicationId),
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

      const [order] = await Order.create(
        [
          {
            orderNumber,
            requestId: new mongoose.Types.ObjectId(data.requestId),
            userId: new mongoose.Types.ObjectId(userId),
            pharmacyId: request.pharmacyId,
            items,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            deliveryAddress: data.deliveryAddress,
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: data.paymentMethod,
            trackingUpdates: [
              {
                status: OrderStatus.CONFIRMED,
                timestamp: new Date(),
                notes: 'Order created from approved medication request',
              },
            ],
          },
        ],
        { session }
      );

      request.status = RequestStatus.FULFILLED;
      request.responseDate = new Date();
      await request.save({ session });

      await session.commitTransaction();
      logger.info(`Order ${orderNumber} created successfully for user ${userId}`);

      return order.populate([
        { path: 'userId', select: 'name email phone' },
        { path: 'pharmacyId', select: 'name location contactInfo' },
      ]);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getOrders(
    filter: OrderFilter,
    pagination: PaginationOptions
  ): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;
    if (filter.paymentStatus) query.paymentStatus = filter.paymentStatus;

    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .populate('pharmacyId', 'name location')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async getOrderById(orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('pharmacyId', 'name location contactInfo')
      .populate('deliveryPartnerId', 'name email phone');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  static async updateOrder(orderId: string, data: UpdateOrderInput): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
      throw ApiError.badRequest(`Cannot update an order with status '${order.status}'`);
    }

    if (data.deliveryAddress) order.deliveryAddress = data.deliveryAddress;
    if (data.deliveryFee !== undefined) {
      order.deliveryFee = data.deliveryFee;
      order.totalAmount = parseFloat(
        (order.subtotal + data.deliveryFee + order.tax).toFixed(2)
      );
    }
    if (data.estimatedDelivery) {
      order.estimatedDelivery = new Date(data.estimatedDelivery);
    }

    await order.save();
    return order;
  }

  static async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusInput
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot update status of a cancelled order');
    }
    if (order.status === OrderStatus.DELIVERED) {
      throw ApiError.badRequest('Order has already been delivered');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
      [OrderStatus.PACKED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status]?.includes(data.status)) {
      throw ApiError.badRequest(
        `Invalid status transition from '${order.status}' to '${data.status}'`
      );
    }

    order.status = data.status;
    order.trackingUpdates.push({
      status: data.status,
      timestamp: new Date(),
      location: data.location,
      notes: data.notes,
    });

    if (data.status === OrderStatus.DELIVERED) {
      order.actualDelivery = new Date();
    }

    await order.save();
    return order;
  }

  /**
   * Process payment through the Stripe gateway.
   * Creates a payment intent, confirms it, and updates the order's payment status.
   */
  static async processPayment(
    orderId: string,
    data: ProcessPaymentInput
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw ApiError.badRequest('Order has already been paid');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot process payment for a cancelled order');
    }

    try {
      const paymentIntent = await StripeService.createPaymentIntent(
        order.totalAmount,
        'usd',
        { orderId: orderId, orderNumber: order.orderNumber }
      );

      const confirmedIntent = await StripeService.confirmPaymentIntent(paymentIntent.id);

      order.paymentStatus = PaymentStatus.PAID;
      order.paymentMethod = data.paymentMethod;
      order.paymentIntentId = confirmedIntent.id;

      await order.save();
      logger.info(`Payment processed for order ${order.orderNumber}: ${confirmedIntent.id}`);
      return order;
    } catch (error) {
      order.paymentStatus = PaymentStatus.FAILED;
      await order.save();

      logger.error(`Payment failed for order ${order.orderNumber}:`, error);
      throw ApiError.badRequest('Payment processing failed. Please try again.');
    }
  }

  /**
   * Cancel an order and refund if payment was made.
   * Uses a transaction to restore inventory quantities atomically.
   */
  static async cancelOrder(
    orderId: string,
    data: CancelOrderInput,
    userId: string,
    userRole: string
  ): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw ApiError.badRequest('Order is already cancelled');
      }
      if (order.status === OrderStatus.DELIVERED) {
        throw ApiError.badRequest('Cannot cancel a delivered order');
      }

      const isOwner = order.userId.toString() === userId;
      const isStaffOrAdmin = ['Pharmacy Staff', 'System Admin'].includes(userRole);
      if (!isOwner && !isStaffOrAdmin) {
        throw ApiError.forbidden('You do not have permission to cancel this order');
      }

      for (const item of order.items) {
        await Inventory.findByIdAndUpdate(
          item.medicationId,
          { $inc: { quantity: item.quantity } },
          { session }
        );
      }

      if (order.paymentStatus === PaymentStatus.PAID && order.paymentIntentId) {
        await StripeService.createRefund(order.paymentIntentId);
        order.paymentStatus = PaymentStatus.REFUNDED;
      }

      order.status = OrderStatus.CANCELLED;
      order.trackingUpdates.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date(),
        notes: data.reason || 'Order cancelled',
      });

      await order.save({ session });

      await MedicationRequest.findByIdAndUpdate(
        order.requestId,
        { status: RequestStatus.AVAILABLE },
        { session }
      );

      await session.commitTransaction();
      logger.info(`Order ${order.orderNumber} cancelled by user ${userId}`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getUserOrders(userId: string, pagination: PaginationOptions) {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .populate('pharmacyId', 'name location')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId }),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  static async getPharmacyOrders(pharmacyId: string, pagination: PaginationOptions) {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ pharmacyId })
        .populate('userId', 'name email phone')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ pharmacyId }),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  static async assignDeliveryPartner(
    orderId: string,
    data: AssignDeliveryInput
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw ApiError.badRequest(`Cannot assign delivery partner to a '${order.status}' order`);
    }

    order.deliveryPartnerId = new mongoose.Types.ObjectId(data.deliveryPartnerId);
    order.trackingUpdates.push({
      status: 'delivery_partner_assigned',
      timestamp: new Date(),
      notes: `Delivery partner ${data.deliveryPartnerId} assigned`,
    });

    await order.save();
    return order.populate('deliveryPartnerId', 'name email phone');
  }

  static async getDeliveryTracking(orderId: string): Promise<{
    order: IOrder;
    trackingUpdates: IOrder['trackingUpdates'];
  }> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name phone')
      .populate('pharmacyId', 'name location')
      .populate('deliveryPartnerId', 'name phone');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return { order, trackingUpdates: order.trackingUpdates };
  }

  static async generateInvoice(orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone address')
      .populate('pharmacyId', 'name location contactInfo');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    order.invoiceUrl = `/invoices/${order.orderNumber}.pdf`;
    await order.save();

    return order;
  }

  static async getDeliveryPartnerOrders(
    partnerId: string,
    pagination: PaginationOptions
  ) {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ deliveryPartnerId: partnerId })
        .populate('userId', 'name phone address')
        .populate('pharmacyId', 'name location')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ deliveryPartnerId: partnerId }),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }
}
