"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const api_response_1 = require("../utils/api-response");
const api_error_1 = require("../utils/api-error");
class OrderController {
    static async createOrder(req, res, next) {
        try {
            if (!req.user)
                throw api_error_1.ApiError.unauthorized();
            const order = await order_service_1.OrderService.createOrder(req.body, String(req.user._id));
            api_response_1.ApiResponse.created(res, order, 'Order created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrders(req, res, next) {
        try {
            const { status, paymentStatus, page, limit, sortBy, sortOrder } = req.query;
            const result = await order_service_1.OrderService.getOrders({
                status: status,
                paymentStatus: paymentStatus,
            }, {
                page: parseInt(String(page ?? '1')),
                limit: parseInt(String(limit ?? '10')),
                sortBy: String(sortBy ?? 'createdAt'),
                sortOrder: (String(sortOrder ?? 'desc')),
            });
            api_response_1.ApiResponse.success(res, result, 'Orders retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrderById(req, res, next) {
        try {
            const order = await order_service_1.OrderService.getOrderById(String(req.params.id));
            api_response_1.ApiResponse.success(res, order, 'Order retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOrder(req, res, next) {
        try {
            const order = await order_service_1.OrderService.updateOrder(String(req.params.id), req.body);
            api_response_1.ApiResponse.success(res, order, 'Order updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOrderStatus(req, res, next) {
        try {
            const order = await order_service_1.OrderService.updateOrderStatus(String(req.params.id), req.body);
            api_response_1.ApiResponse.success(res, order, 'Order status updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async processPayment(req, res, next) {
        try {
            const order = await order_service_1.OrderService.processPayment(String(req.params.id), req.body);
            api_response_1.ApiResponse.success(res, order, 'Payment processed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelOrder(req, res, next) {
        try {
            if (!req.user)
                throw api_error_1.ApiError.unauthorized();
            const order = await order_service_1.OrderService.cancelOrder(String(req.params.id), req.body, String(req.user._id), req.user.role);
            api_response_1.ApiResponse.success(res, order, 'Order cancelled successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserOrders(req, res, next) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const result = await order_service_1.OrderService.getUserOrders(String(req.params.userId), {
                page: parseInt(String(page ?? '1')),
                limit: parseInt(String(limit ?? '10')),
                sortBy: String(sortBy ?? 'createdAt'),
                sortOrder: (String(sortOrder ?? 'desc')),
            });
            api_response_1.ApiResponse.success(res, result, 'User orders retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getPharmacyOrders(req, res, next) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const result = await order_service_1.OrderService.getPharmacyOrders(String(req.params.pharmacyId), {
                page: parseInt(String(page ?? '1')),
                limit: parseInt(String(limit ?? '10')),
                sortBy: String(sortBy ?? 'createdAt'),
                sortOrder: (String(sortOrder ?? 'desc')),
            });
            api_response_1.ApiResponse.success(res, result, 'Pharmacy orders retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async assignDeliveryPartner(req, res, next) {
        try {
            const order = await order_service_1.OrderService.assignDeliveryPartner(String(req.params.id), req.body);
            api_response_1.ApiResponse.success(res, order, 'Delivery partner assigned successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getDeliveryTracking(req, res, next) {
        try {
            const tracking = await order_service_1.OrderService.getDeliveryTracking(String(req.params.id));
            api_response_1.ApiResponse.success(res, tracking, 'Tracking info retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async generateInvoice(req, res, next) {
        try {
            const order = await order_service_1.OrderService.generateInvoice(String(req.params.id));
            api_response_1.ApiResponse.success(res, order, 'Invoice generated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getDeliveryPartnerOrders(req, res, next) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const result = await order_service_1.OrderService.getDeliveryPartnerOrders(String(req.params.partnerId), {
                page: parseInt(String(page ?? '1')),
                limit: parseInt(String(limit ?? '10')),
                sortBy: String(sortBy ?? 'createdAt'),
                sortOrder: (String(sortOrder ?? 'desc')),
            });
            api_response_1.ApiResponse.success(res, result, 'Delivery partner orders retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map