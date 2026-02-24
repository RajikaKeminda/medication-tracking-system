"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const request_service_1 = require("../services/request.service");
const api_response_1 = require("../utils/api-response");
const api_error_1 = require("../utils/api-error");
const user_model_1 = require("../models/user.model");
/** Narrow req.params values safely to string (Express v5 @types uses string | string[]) */
function param(req, key) {
    const v = req.params[key];
    return Array.isArray(v) ? v[0] : v;
}
/** Read pagination/filter query — already validated by Zod middleware */
function getQuery(req) {
    return req.query;
}
class RequestController {
    /** POST /api/requests — Patient creates a new medication request */
    static async createRequest(req, res, next) {
        try {
            const userId = String(req.user._id);
            const request = await request_service_1.RequestService.createRequest(req.body, userId);
            api_response_1.ApiResponse.created(res, request, 'Medication request created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /** GET /api/requests — System admin / pharmacy staff sees all (with filters) */
    static async getRequests(req, res, next) {
        try {
            const result = await request_service_1.RequestService.getRequests(getQuery(req));
            api_response_1.ApiResponse.success(res, result, 'Requests retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /** GET /api/requests/urgent — All urgent-priority requests (admin / pharmacy staff) */
    static async getUrgentRequests(req, res, next) {
        try {
            const result = await request_service_1.RequestService.getUrgentRequests(getQuery(req));
            api_response_1.ApiResponse.success(res, result, 'Urgent requests retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/requests/user/:userId
     * Patients can only access their own; admins can access any user's.
     */
    static async getRequestsByUser(req, res, next) {
        try {
            const userId = param(req, 'userId');
            const currentUser = req.user;
            if (currentUser.role === user_model_1.UserRole.PATIENT &&
                String(currentUser._id) !== userId) {
                return next(api_error_1.ApiError.forbidden('You can only view your own requests'));
            }
            const result = await request_service_1.RequestService.getRequestsByUser(userId, getQuery(req));
            api_response_1.ApiResponse.success(res, result, 'User requests retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /** GET /api/requests/pharmacy/:pharmacyId — Pharmacy staff / admin only */
    static async getRequestsByPharmacy(req, res, next) {
        try {
            const pharmacyId = param(req, 'pharmacyId');
            const currentUser = req.user;
            if (currentUser.role === user_model_1.UserRole.PHARMACY_STAFF &&
                String(currentUser.pharmacyId) !== pharmacyId) {
                return next(api_error_1.ApiError.forbidden('You can only view requests for your own pharmacy'));
            }
            const result = await request_service_1.RequestService.getRequestsByPharmacy(pharmacyId, getQuery(req));
            api_response_1.ApiResponse.success(res, result, 'Pharmacy requests retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /** GET /api/requests/:id — Get a single request (owner or staff/admin) */
    static async getRequestById(req, res, next) {
        try {
            const requestId = param(req, 'id');
            const request = await request_service_1.RequestService.getRequestById(requestId);
            const currentUser = req.user;
            if (currentUser.role === user_model_1.UserRole.PATIENT &&
                String(request.userId) !== String(currentUser._id)) {
                return next(api_error_1.ApiError.forbidden('Access denied'));
            }
            api_response_1.ApiResponse.success(res, request, 'Request retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/requests/:id
     * Patient updates their own PENDING request (quantity, urgencyLevel, notes, prescriptionImage).
     */
    static async updateRequest(req, res, next) {
        try {
            const requestId = param(req, 'id');
            const userId = String(req.user._id);
            const request = await request_service_1.RequestService.updateRequest(requestId, req.body, userId);
            api_response_1.ApiResponse.success(res, request, 'Request updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/requests/:id/status
     * Pharmacy staff updates the request status. Triggers patient notification.
     */
    static async updateRequestStatus(req, res, next) {
        try {
            const requestId = param(req, 'id');
            const currentUser = req.user;
            // System admins bypass pharmacy scoping
            const pharmacyId = currentUser.role === user_model_1.UserRole.PHARMACY_STAFF
                ? String(currentUser.pharmacyId)
                : undefined;
            const request = await request_service_1.RequestService.updateRequestStatus(requestId, req.body, pharmacyId);
            api_response_1.ApiResponse.success(res, request, 'Request status updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/requests/:id
     * Cancel a request. Patients cancel their own; pharmacy staff/admin can cancel any.
     */
    static async cancelRequest(req, res, next) {
        try {
            const requestId = param(req, 'id');
            const currentUser = req.user;
            const request = await request_service_1.RequestService.cancelRequest(requestId, String(currentUser._id), currentUser.role);
            api_response_1.ApiResponse.success(res, request, 'Request cancelled successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RequestController = RequestController;
//# sourceMappingURL=request.controller.js.map