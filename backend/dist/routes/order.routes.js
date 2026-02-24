"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const user_model_1 = require("../models/user.model");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order & delivery management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         medicationId:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         unitPrice:
 *           type: number
 *         totalPrice:
 *           type: number
 *     DeliveryAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - postalCode
 *         - phoneNumber
 *       properties:
 *         street:
 *           type: string
 *         city:
 *           type: string
 *         postalCode:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *     TrackingUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         notes:
 *           type: string
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *           example: "ORD-2026-000001"
 *         requestId:
 *           type: string
 *         userId:
 *           type: string
 *         pharmacyId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         subtotal:
 *           type: number
 *         deliveryFee:
 *           type: number
 *         tax:
 *           type: number
 *         totalAmount:
 *           type: number
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         status:
 *           type: string
 *           enum: [confirmed, packed, out_for_delivery, delivered, cancelled]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         paymentMethod:
 *           type: string
 *           enum: [card, cash, online]
 *         paymentIntentId:
 *           type: string
 *         trackingUpdates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrackingUpdate'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - requestId
 *         - items
 *         - deliveryAddress
 *       properties:
 *         requestId:
 *           type: string
 *           example: "60d5ecb54b24a90015c0b1a2"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - medicationId
 *               - name
 *               - quantity
 *               - unitPrice
 *             properties:
 *               medicationId:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: "Paracetamol 500mg"
 *               quantity:
 *                 type: number
 *                 example: 2
 *               unitPrice:
 *                 type: number
 *                 example: 5.99
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         deliveryFee:
 *           type: number
 *           default: 0
 *         paymentMethod:
 *           type: string
 *           enum: [card, cash, online]
 */
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from approved request
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or insufficient stock
 *       404:
 *         description: Request not found
 */
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PATIENT), (0, validate_middleware_1.validate)(order_validator_1.createOrderSchema), order_controller_1.OrderController.createOrder);
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with filters
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, packed, out_for_delivery, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PHARMACY_STAFF, user_model_1.UserRole.SYSTEM_ADMIN), order_controller_1.OrderController.getOrders);
/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: Get order history for a specific user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 */
router.get('/user/:userId', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PATIENT, user_model_1.UserRole.SYSTEM_ADMIN), (0, validate_middleware_1.validate)(order_validator_1.userIdParamSchema), order_controller_1.OrderController.getUserOrders);
/**
 * @swagger
 * /orders/pharmacy/{pharmacyId}:
 *   get:
 *     summary: Get orders for a specific pharmacy
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pharmacy orders retrieved successfully
 */
router.get('/pharmacy/:pharmacyId', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PHARMACY_STAFF, user_model_1.UserRole.SYSTEM_ADMIN), (0, validate_middleware_1.validate)(order_validator_1.pharmacyIdParamSchema), order_controller_1.OrderController.getPharmacyOrders);
/**
 * @swagger
 * /orders/delivery-partner/{partnerId}:
 *   get:
 *     summary: Get assigned deliveries for a delivery partner
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery partner orders retrieved successfully
 */
router.get('/delivery-partner/:partnerId', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(order_validator_1.partnerIdParamSchema), order_controller_1.OrderController.getDeliveryPartnerOrders);
/**
 * @swagger
 * /orders/track/{id}:
 *   get:
 *     summary: Get real-time delivery tracking for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking info retrieved
 *       404:
 *         description: Order not found
 */
router.get('/track/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(order_validator_1.orderIdParamSchema), order_controller_1.OrderController.getDeliveryTracking);
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get specific order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 */
router.get('/:id', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(order_validator_1.orderIdParamSchema), order_controller_1.OrderController.getOrderById);
/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order details (delivery address, fee, estimated delivery)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 $ref: '#/components/schemas/DeliveryAddress'
 *               deliveryFee:
 *                 type: number
 *               estimatedDelivery:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Cannot update delivered/cancelled order
 */
router.put('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PHARMACY_STAFF, user_model_1.UserRole.SYSTEM_ADMIN), (0, validate_middleware_1.validate)(order_validator_1.updateOrderSchema), order_controller_1.OrderController.updateOrder);
/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, packed, out_for_delivery, delivered, cancelled]
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PHARMACY_STAFF, user_model_1.UserRole.SYSTEM_ADMIN), (0, validate_middleware_1.validate)(order_validator_1.updateOrderStatusSchema), order_controller_1.OrderController.updateOrderStatus);
/**
 * @swagger
 * /orders/{id}/payment:
 *   post:
 *     summary: Process payment for an order via Stripe
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, cash, online]
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Payment failed or order already paid
 */
router.post('/:id/payment', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PATIENT), (0, validate_middleware_1.validate)(order_validator_1.processPaymentSchema), order_controller_1.OrderController.processPayment);
/**
 * @swagger
 * /orders/{id}/invoice:
 *   post:
 *     summary: Generate order invoice
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice generated successfully
 *       404:
 *         description: Order not found
 */
router.post('/:id/invoice', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(order_validator_1.orderIdParamSchema), order_controller_1.OrderController.generateInvoice);
/**
 * @swagger
 * /orders/{id}/assign-delivery:
 *   patch:
 *     summary: Assign a delivery partner to an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPartnerId
 *             properties:
 *               deliveryPartnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery partner assigned
 *       404:
 *         description: Order not found
 */
router.patch('/:id/assign-delivery', auth_middleware_1.authenticate, (0, rbac_middleware_1.authorize)(user_model_1.UserRole.PHARMACY_STAFF, user_model_1.UserRole.SYSTEM_ADMIN), (0, validate_middleware_1.validate)(order_validator_1.assignDeliverySchema), order_controller_1.OrderController.assignDeliveryPartner);
/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order with optional refund
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled and refund processed if applicable
 *       400:
 *         description: Cannot cancel delivered order
 */
router.patch('/:id/cancel', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(order_validator_1.cancelOrderSchema), order_controller_1.OrderController.cancelOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map