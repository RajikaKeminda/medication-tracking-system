"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const request_model_1 = require("../models/request.model");
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const logger_1 = require("../utils/logger");
const notification_service_1 = require("./notification.service");
// Status transitions allowed for pharmacy staff
const VALID_STATUS_TRANSITIONS = {
    [request_model_1.RequestStatus.PENDING]: [request_model_1.RequestStatus.PROCESSING, request_model_1.RequestStatus.UNAVAILABLE, request_model_1.RequestStatus.CANCELLED],
    [request_model_1.RequestStatus.PROCESSING]: [request_model_1.RequestStatus.AVAILABLE, request_model_1.RequestStatus.UNAVAILABLE, request_model_1.RequestStatus.CANCELLED],
    [request_model_1.RequestStatus.AVAILABLE]: [request_model_1.RequestStatus.FULFILLED, request_model_1.RequestStatus.CANCELLED],
    [request_model_1.RequestStatus.UNAVAILABLE]: [request_model_1.RequestStatus.CANCELLED],
    [request_model_1.RequestStatus.FULFILLED]: [],
    [request_model_1.RequestStatus.CANCELLED]: [],
};
// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Fetch the patient associated with a request and fire notifications.
 * Errors in notification sending are non-fatal — they are logged and swallowed.
 */
async function dispatchNotification(request, type) {
    try {
        const patient = await user_model_1.User.findById(request.userId).select('name email phone');
        if (!patient)
            return;
        const opts = {
            email: patient.email,
            phone: patient.phone,
            patientName: patient.name,
            medicationName: request.medicationName,
            requestId: String(request._id),
        };
        if (type === 'created') {
            await notification_service_1.NotificationService.notifyRequestCreated(opts);
        }
        else if (type === 'cancelled') {
            await notification_service_1.NotificationService.notifyRequestCancelled(opts);
        }
        else {
            await notification_service_1.NotificationService.notifyStatusChanged({
                ...opts,
                newStatus: request.status,
            });
        }
    }
    catch (err) {
        logger_1.logger.error(`Notification dispatch failed for request ${request._id}:`, err);
    }
}
// ─── Service class ────────────────────────────────────────────────────────────
class RequestService {
    /**
     * Create a new medication request owned by the authenticated patient.
     */
    static async createRequest(data, userId) {
        const request = await request_model_1.MedicationRequest.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            pharmacyId: new mongoose_1.default.Types.ObjectId(data.pharmacyId),
            medicationName: data.medicationName,
            quantity: data.quantity,
            urgencyLevel: data.urgencyLevel,
            prescriptionRequired: data.prescriptionRequired,
            prescriptionImage: data.prescriptionImage,
            notes: data.notes,
            estimatedAvailability: data.estimatedAvailability
                ? new Date(data.estimatedAvailability)
                : undefined,
            requestDate: new Date(),
        });
        logger_1.logger.info(`Medication request ${request._id} created by user ${userId}`);
        // Fire-and-forget notification
        dispatchNotification(request, 'created');
        return request.populate([
            { path: 'userId', select: 'name email phone' },
            { path: 'pharmacyId', select: 'name location contactInfo' },
        ]);
    }
    /**
     * List all requests with optional filters. Admins/pharmacy staff see all;
     * the caller's role filtering is enforced at the controller level.
     */
    static async getRequests(query) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.urgencyLevel)
            filter.urgencyLevel = query.urgencyLevel;
        if (query.dateFrom || query.dateTo) {
            filter.requestDate = {
                ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
                ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
            };
        }
        const { page, limit, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            request_model_1.MedicationRequest.find(filter)
                .populate('userId', 'name email phone')
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            request_model_1.MedicationRequest.countDocuments(filter),
        ]);
        return { requests, total, page, pages: Math.ceil(total / limit) };
    }
    /** Retrieve a single request by ID. */
    static async getRequestById(requestId) {
        const request = await request_model_1.MedicationRequest.findById(requestId)
            .populate('userId', 'name email phone')
            .populate('pharmacyId', 'name location contactInfo');
        if (!request)
            throw api_error_1.ApiError.notFound('Medication request not found');
        return request;
    }
    /**
     * Retrieve all requests belonging to a specific patient.
     * The route guard ensures a Patient can only call this for their own userId.
     */
    static async getRequestsByUser(userId, query) {
        const filter = { userId };
        if (query.status)
            filter.status = query.status;
        if (query.urgencyLevel)
            filter.urgencyLevel = query.urgencyLevel;
        const { page, limit, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            request_model_1.MedicationRequest.find(filter)
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            request_model_1.MedicationRequest.countDocuments(filter),
        ]);
        return { requests, total, page, pages: Math.ceil(total / limit) };
    }
    /** Retrieve all requests assigned to a specific pharmacy. */
    static async getRequestsByPharmacy(pharmacyId, query) {
        const filter = { pharmacyId };
        if (query.status)
            filter.status = query.status;
        if (query.urgencyLevel)
            filter.urgencyLevel = query.urgencyLevel;
        const { page, limit, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            request_model_1.MedicationRequest.find(filter)
                .populate('userId', 'name email phone')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            request_model_1.MedicationRequest.countDocuments(filter),
        ]);
        return { requests, total, page, pages: Math.ceil(total / limit) };
    }
    /** Get all requests with urgency level = "urgent". */
    static async getUrgentRequests(query) {
        const { page, limit, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            request_model_1.MedicationRequest.find({ urgencyLevel: 'urgent' })
                .populate('userId', 'name email phone')
                .populate('pharmacyId', 'name location')
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            request_model_1.MedicationRequest.countDocuments({ urgencyLevel: 'urgent' }),
        ]);
        return { requests, total, page, pages: Math.ceil(total / limit) };
    }
    /**
     * Update editable fields of a PENDING request.
     * Only the owning patient may perform this action (enforced at controller level).
     */
    static async updateRequest(requestId, data, userId) {
        const request = await request_model_1.MedicationRequest.findById(requestId);
        if (!request)
            throw api_error_1.ApiError.notFound('Medication request not found');
        if (request.userId.toString() !== userId) {
            throw api_error_1.ApiError.forbidden('You can only update your own requests');
        }
        if (request.status !== request_model_1.RequestStatus.PENDING) {
            throw api_error_1.ApiError.badRequest(`Only pending requests can be edited. Current status: '${request.status}'`);
        }
        if (data.quantity !== undefined)
            request.quantity = data.quantity;
        if (data.urgencyLevel !== undefined)
            request.urgencyLevel = data.urgencyLevel;
        if (data.notes !== undefined)
            request.notes = data.notes;
        if (data.prescriptionImage !== undefined)
            request.prescriptionImage = data.prescriptionImage;
        await request.save();
        logger_1.logger.info(`Request ${requestId} updated by user ${userId}`);
        return request;
    }
    /**
     * Update the status of a request (pharmacy staff only).
     * Enforces valid status state-machine transitions.
     */
    static async updateRequestStatus(requestId, data, pharmacyId) {
        const request = await request_model_1.MedicationRequest.findById(requestId);
        if (!request)
            throw api_error_1.ApiError.notFound('Medication request not found');
        // Pharmacy staff can only change status on requests assigned to their pharmacy
        if (pharmacyId && request.pharmacyId.toString() !== pharmacyId) {
            throw api_error_1.ApiError.forbidden('This request does not belong to your pharmacy');
        }
        const validNext = VALID_STATUS_TRANSITIONS[request.status];
        if (!validNext.includes(data.status)) {
            throw api_error_1.ApiError.badRequest(`Invalid status transition from '${request.status}' to '${data.status}'. ` +
                `Allowed: ${validNext.length ? validNext.join(', ') : 'none'}`);
        }
        request.status = data.status;
        if (data.responseDate)
            request.responseDate = new Date(data.responseDate);
        if (data.estimatedAvailability)
            request.estimatedAvailability = new Date(data.estimatedAvailability);
        if (data.notes)
            request.notes = data.notes;
        await request.save();
        logger_1.logger.info(`Request ${requestId} status → ${data.status}`);
        // Notify patient of status change
        dispatchNotification(request, 'status_changed');
        return request.populate([
            { path: 'userId', select: 'name email phone' },
            { path: 'pharmacyId', select: 'name location' },
        ]);
    }
    /**
     * Cancel a pending request.
     * Patients can only cancel their own requests; pharmacy staff/admins can cancel any.
     */
    static async cancelRequest(requestId, userId, userRole) {
        const request = await request_model_1.MedicationRequest.findById(requestId);
        if (!request)
            throw api_error_1.ApiError.notFound('Medication request not found');
        const isOwner = request.userId.toString() === userId;
        const isStaffOrAdmin = ['Pharmacy Staff', 'System Admin'].includes(userRole);
        if (!isOwner && !isStaffOrAdmin) {
            throw api_error_1.ApiError.forbidden('You do not have permission to cancel this request');
        }
        if (request.status === request_model_1.RequestStatus.CANCELLED ||
            request.status === request_model_1.RequestStatus.FULFILLED) {
            throw api_error_1.ApiError.badRequest(`Cannot cancel a request with status '${request.status}'`);
        }
        request.status = request_model_1.RequestStatus.CANCELLED;
        request.responseDate = new Date();
        await request.save();
        logger_1.logger.info(`Request ${requestId} cancelled by user ${userId}`);
        dispatchNotification(request, 'cancelled');
        return request;
    }
}
exports.RequestService = RequestService;
//# sourceMappingURL=request.service.js.map