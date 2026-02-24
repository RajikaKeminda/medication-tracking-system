"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerIdParamSchema = exports.pharmacyIdParamSchema = exports.userIdParamSchema = exports.orderIdParamSchema = exports.getOrdersQuerySchema = exports.cancelOrderSchema = exports.assignDeliverySchema = exports.processPaymentSchema = exports.updateOrderStatusSchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const order_model_1 = require("../models/order.model");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = zod_1.z.string().regex(objectIdRegex, 'Invalid ObjectId format');
const orderItemSchema = zod_1.z.object({
    medicationId: objectId,
    name: zod_1.z.string().min(1, 'Medication name is required').trim(),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
    unitPrice: zod_1.z.number().min(0, 'Unit price cannot be negative'),
});
const deliveryAddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Street is required').trim(),
    city: zod_1.z.string().min(1, 'City is required').trim(),
    postalCode: zod_1.z.string().min(1, 'Postal code is required').trim(),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number format'),
    coordinates: zod_1.z
        .object({
        latitude: zod_1.z.number().min(-90).max(90),
        longitude: zod_1.z.number().min(-180).max(180),
    })
        .optional(),
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        requestId: objectId,
        items: zod_1.z.array(orderItemSchema).min(1, 'At least one item is required'),
        deliveryAddress: deliveryAddressSchema,
        deliveryFee: zod_1.z.number().min(0, 'Delivery fee cannot be negative').default(0),
        paymentMethod: zod_1.z
            .nativeEnum(order_model_1.PaymentMethod, {
            errorMap: () => ({
                message: `Payment method must be one of: ${Object.values(order_model_1.PaymentMethod).join(', ')}`,
            }),
        })
            .optional(),
    }),
});
exports.updateOrderSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
    body: zod_1.z.object({
        deliveryAddress: deliveryAddressSchema.optional(),
        deliveryFee: zod_1.z.number().min(0).optional(),
        estimatedDelivery: zod_1.z.string().datetime().optional(),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(order_model_1.OrderStatus, {
            errorMap: () => ({
                message: `Status must be one of: ${Object.values(order_model_1.OrderStatus).join(', ')}`,
            }),
        }),
        location: zod_1.z.string().trim().optional(),
        notes: zod_1.z.string().trim().optional(),
    }),
});
exports.processPaymentSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
    body: zod_1.z.object({
        paymentMethod: zod_1.z.nativeEnum(order_model_1.PaymentMethod, {
            errorMap: () => ({
                message: `Payment method must be one of: ${Object.values(order_model_1.PaymentMethod).join(', ')}`,
            }),
        }),
    }),
});
exports.assignDeliverySchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
    body: zod_1.z.object({
        deliveryPartnerId: objectId,
    }),
});
exports.cancelOrderSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
    body: zod_1.z.object({
        reason: zod_1.z.string().trim().optional(),
    }),
});
exports.getOrdersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(order_model_1.OrderStatus).optional(),
        paymentStatus: zod_1.z.string().optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/).optional().default('10'),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
exports.orderIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId }),
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ userId: objectId }),
});
exports.pharmacyIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ pharmacyId: objectId }),
});
exports.partnerIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ partnerId: objectId }),
});
//# sourceMappingURL=order.validator.js.map